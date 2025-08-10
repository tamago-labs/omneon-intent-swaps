import { HermesClient } from "@pythnetwork/hermes-client";

// Pyth price feed IDs for major tokens
export const PYTH_PRICE_FEEDS = {
  'ETH/USD': '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
  'SUI/USD': '0x23d7315113f5b1d3ba7a83604c44b94d79f4fd69af77f804fc7f920a6dc65744',
  'BTC/USD': '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',
  'USDC/USD': null, // Assume 1:1 for stablecoins
  'USDT/USD': null, // Assume 1:1 for stablecoins
} as const;

// Token symbol mapping to Pyth feed IDs
export const TOKEN_TO_PYTH_FEED: Record<string, string | null> = {
  'WETH': PYTH_PRICE_FEEDS['ETH/USD'],
  'ETH': PYTH_PRICE_FEEDS['ETH/USD'],
  'SUI': PYTH_PRICE_FEEDS['SUI/USD'],
  'WBTC': PYTH_PRICE_FEEDS['BTC/USD'],
  'BTC': PYTH_PRICE_FEEDS['BTC/USD'],
  'USDC': PYTH_PRICE_FEEDS['USDC/USD'], // null - will default to 1.0
  'USDT': PYTH_PRICE_FEEDS['USDT/USD'], // null - will default to 1.0
};

export interface PythPriceData {
  id: string;
  symbol: string;
  price: number;
  publishTime: string | null;
  confidence?: number;
}

export interface PythPriceResult {
  success: boolean;
  prices?: PythPriceData[];
  error?: string;
}

/**
 * Get latest price updates for the provided price feed IDs
 * @param priceIds Array of price feed IDs
 * @returns Latest price updates
 */
export const getLatestPriceUpdates = async (priceIds: string[]): Promise<PythPriceResult> => {
  try {
    const client = new HermesClient("https://hermes.pyth.network", {});
    const priceUpdates = await client.getLatestPriceUpdates(priceIds);
    
    // Format the price data for better readability
    const formattedPrices = priceUpdates.parsed ? priceUpdates.parsed.map((update) => {
      let price = 1;
      if (update.ema_price.expo > 0) {
        price = Number(update.ema_price.price) * (10 ** Math.abs(update.ema_price.expo));
      } else {
        price = Number(update.ema_price.price) / (10 ** Math.abs(update.ema_price.expo));
      }
      
      return {
        id: update.id,
        symbol: getSymbolFromPriceId(update.id),
        price: price || 1,
        publishTime: update.ema_price ? new Date(update.ema_price.publish_time * 1000).toISOString() : null,
        confidence: update.ema_price.conf ? Number(update.ema_price.conf) / (10 ** Math.abs(update.ema_price.expo)) : undefined,
      } as PythPriceData;
    }) : [];
    
    return {
      success: true,
      prices: formattedPrices,
    };
  } catch (error: any) {
    console.error('Error getting price updates:', error);
    return {
      success: false,
      error: error.message || 'Failed to get price updates'
    };
  }
};

/**
 * Get price for a single token symbol
 * @param tokenSymbol Token symbol (e.g., 'WETH', 'SUI', 'USDC')
 * @returns Token price in USD
 */
export const getTokenPrice = async (tokenSymbol: string): Promise<number> => {
  // Handle stablecoins - assume 1:1 USD peg
  if (['USDC', 'USDT', 'DAI', 'FRAX'].includes(tokenSymbol.toUpperCase())) {
    return 1.0;
  }

  const priceId = TOKEN_TO_PYTH_FEED[tokenSymbol.toUpperCase()];
  
  if (!priceId) {
    console.warn(`No Pyth price feed found for token: ${tokenSymbol}, defaulting to $1.00`);
    return 1.0;
  }

  try {
    const result = await getLatestPriceUpdates([priceId]);
    
    if (result.success && result.prices && result.prices.length > 0) {
      return result.prices[0].price;
    } else {
      console.warn(`Failed to get price for ${tokenSymbol}:`, result.error);
      return 1.0; // Fallback price
    }
  } catch (error) {
    console.error(`Error getting price for ${tokenSymbol}:`, error);
    return 1.0; // Fallback price
  }
};

/**
 * Get prices for multiple tokens at once
 * @param tokenSymbols Array of token symbols
 * @returns Map of token symbol to price
 */
export const getMultipleTokenPrices = async (tokenSymbols: string[]): Promise<Record<string, number>> => {
  const priceMap: Record<string, number> = {};
  
  // Separate stablecoins from tokens that need price feeds
  const stablecoins = tokenSymbols.filter(symbol => 
    ['USDC', 'USDT', 'DAI', 'FRAX'].includes(symbol.toUpperCase())
  );
  
  const nonStablecoins = tokenSymbols.filter(symbol => 
    !['USDC', 'USDT', 'DAI', 'FRAX'].includes(symbol.toUpperCase())
  );

  // Set stablecoins to $1.00
  stablecoins.forEach(symbol => {
    priceMap[symbol] = 1.0;
  });

  // Get price feeds for non-stablecoins
  const priceIds = nonStablecoins
    .map(symbol => TOKEN_TO_PYTH_FEED[symbol.toUpperCase()])
    .filter((id): id is string => id !== null && id !== undefined);

  if (priceIds.length > 0) {
    try {
      const result = await getLatestPriceUpdates(priceIds);
      
      if (result.success && result.prices) {
        result.prices.forEach(priceData => {
          const symbol = getSymbolFromPriceId(priceData.id);
          if (symbol) {
            priceMap[symbol] = priceData.price;
          }
        });
      }
    } catch (error) {
      console.error('Error getting multiple token prices:', error);
    }
  }

  // Fill in any missing prices with fallback
  tokenSymbols.forEach(symbol => {
    if (!(symbol in priceMap)) {
      console.warn(`No price found for ${symbol}, using fallback price $1.00`);
      priceMap[symbol] = 1.0;
    }
  });

  return priceMap;
};

/**
 * Calculate conversion rate between two tokens
 * @param fromToken Source token symbol
 * @param toToken Target token symbol
 * @returns Exchange rate (how much toToken you get for 1 fromToken)
 */
export const getTokenConversionRate = async (fromToken: string, toToken: string): Promise<number> => {
  const prices = await getMultipleTokenPrices([fromToken, toToken]);
  
  const fromPrice = prices[fromToken] || 1.0;
  const toPrice = prices[toToken] || 1.0;
  
  // Calculate conversion rate: fromPrice / toPrice
  return fromPrice / toPrice;
};

/**
 * Convert amount from one token to another using USD prices
 * @param amount Amount in source token
 * @param fromToken Source token symbol
 * @param toToken Target token symbol
 * @returns Converted amount in target token
 */
export const convertTokenAmount = async (
  amount: number, 
  fromToken: string, 
  toToken: string
): Promise<number> => {
  const conversionRate = await getTokenConversionRate(fromToken, toToken);
  return amount * conversionRate;
};

/**
 * Get symbol from Pyth price feed ID
 * @param priceId Pyth price feed ID
 * @returns Token symbol or null if not found
 */
function getSymbolFromPriceId(priceId: string): string | null {
  for (const [symbol, feedId] of Object.entries(TOKEN_TO_PYTH_FEED)) {
    if (feedId === priceId) {
      return symbol;
    }
  }
  
  // Map from feed display names
  const feedToSymbol: Record<string, string> = {
    [PYTH_PRICE_FEEDS['ETH/USD']]: 'WETH',
    [PYTH_PRICE_FEEDS['SUI/USD']]: 'SUI', 
    [PYTH_PRICE_FEEDS['BTC/USD']]: 'WBTC',
  };
  
  return feedToSymbol[priceId] || null;
}

/**
 * Get formatted price string with proper decimals and currency symbol
 * @param price Price in USD
 * @returns Formatted price string (e.g., "$1,234.56")
 */
export const formatPrice = (price: number): string => {
  if (price === 0) return '$0.00';
  
  if (price < 0.01) {
    return `$${price.toExponential(2)}`;
  } else if (price < 1) {
    return `$${price.toFixed(4)}`;
  } else if (price < 1000) {
    return `$${price.toFixed(2)}`;
  } else {
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
};

/**
 * Check if a token is a stablecoin
 * @param tokenSymbol Token symbol
 * @returns True if token is considered a stablecoin
 */
export const isStablecoin = (tokenSymbol: string): boolean => {
  return ['USDC', 'USDT', 'DAI', 'FRAX', 'BUSD'].includes(tokenSymbol.toUpperCase());
};

/**
 * Get price change percentage (mock implementation - would need historical data)
 * @param tokenSymbol Token symbol
 * @returns Price change percentage (positive/negative)
 */
export const getPriceChange24h = async (tokenSymbol: string): Promise<number> => {
  // This is a mock implementation
  // In a real implementation, you'd fetch historical price data
  const mockChanges: Record<string, number> = {
    'WETH': 2.45,
    'SUI': -1.23,
    'WBTC': 3.67,
    'USDC': 0.01,
    'USDT': -0.02,
  };
  
  return mockChanges[tokenSymbol.toUpperCase()] || 0;
};
