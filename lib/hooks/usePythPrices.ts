import { useState, useEffect, useCallback } from 'react';
import { 
  getTokenPrice, 
  getMultipleTokenPrices, 
  getTokenConversionRate,
  convertTokenAmount,
  formatPrice,
  isStablecoin 
} from '@/lib/services/pyth-price-service';

export interface TokenPrice {
  symbol: string;
  price: number;
  formattedPrice: string;
  lastUpdated: Date;
  isStablecoin: boolean;
}

export interface ConversionData {
  fromToken: string;
  toToken: string;
  rate: number;
  estimatedOutput: number;
  lastUpdated: Date;
}

/**
 * Hook to get real-time price for a single token
 */
export const useTokenPrice = (tokenSymbol: string, refreshInterval = 30000) => {
  const [price, setPrice] = useState<TokenPrice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrice = useCallback(async () => {
    if (!tokenSymbol) return;

    try {
      setLoading(true);
      setError(null);

      const priceValue = await getTokenPrice(tokenSymbol);
      
      setPrice({
        symbol: tokenSymbol,
        price: priceValue,
        formattedPrice: formatPrice(priceValue),
        lastUpdated: new Date(),
        isStablecoin: isStablecoin(tokenSymbol)
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch price');
      console.error(`Error fetching price for ${tokenSymbol}:`, err);
    } finally {
      setLoading(false);
    }
  }, [tokenSymbol]);

  useEffect(() => {
    fetchPrice();

    if (refreshInterval > 0) {
      const interval = setInterval(fetchPrice, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchPrice, refreshInterval]);

  return { price, loading, error, refetch: fetchPrice };
};

/**
 * Hook to get prices for multiple tokens
 */
export const useMultipleTokenPrices = (tokenSymbols: string[], refreshInterval = 30000) => {
  const [prices, setPrices] = useState<Record<string, TokenPrice>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = useCallback(async () => {
    if (!tokenSymbols.length) return;

    try {
      setLoading(true);
      setError(null);

      const priceData = await getMultipleTokenPrices(tokenSymbols);
      const now = new Date();
      
      const formattedPrices: Record<string, TokenPrice> = {};
      
      for (const [symbol, price] of Object.entries(priceData)) {
        formattedPrices[symbol] = {
          symbol,
          price,
          formattedPrice: formatPrice(price),
          lastUpdated: now,
          isStablecoin: isStablecoin(symbol)
        };
      }
      
      setPrices(formattedPrices);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch prices');
      console.error('Error fetching multiple token prices:', err);
    } finally {
      setLoading(false);
    }
  }, [tokenSymbols]);

  useEffect(() => {
    fetchPrices();

    if (refreshInterval > 0) {
      const interval = setInterval(fetchPrices, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchPrices, refreshInterval]);

  return { prices, loading, error, refetch: fetchPrices };
};

/**
 * Hook to get conversion rate and estimate output between two tokens
 */
export const usePythConversion = (
  fromToken: string,
  toToken: string, 
  amount: string | number,
  refreshInterval = 30000
) => {
  const [conversion, setConversion] = useState<ConversionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversion = useCallback(async () => {
    if (!fromToken || !toToken || !amount) return;

    try {
      setLoading(true);
      setError(null);

      const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
      
      if (isNaN(numericAmount) || numericAmount <= 0) {
        setConversion(null);
        setLoading(false);
        return;
      }

      const [conversionRate, estimatedOutput] = await Promise.all([
        getTokenConversionRate(fromToken, toToken),
        convertTokenAmount(numericAmount, fromToken, toToken)
      ]);
      
      setConversion({
        fromToken,
        toToken,
        rate: conversionRate,
        estimatedOutput,
        lastUpdated: new Date()
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch conversion rate');
      console.error(`Error fetching conversion ${fromToken} -> ${toToken}:`, err);
    } finally {
      setLoading(false);
    }
  }, [fromToken, toToken, amount]);

  useEffect(() => {
    fetchConversion();

    if (refreshInterval > 0) {
      const interval = setInterval(fetchConversion, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchConversion, refreshInterval]);

  return { conversion, loading, error, refetch: fetchConversion };
};

/**
 * Hook to get live token prices for display in token selection
 */
export const useTokenPricesForDisplay = (tokenSymbols: string[]) => {
  const { prices, loading, error } = useMultipleTokenPrices(tokenSymbols, 60000); // Refresh every minute

  const getPriceForToken = useCallback((symbol: string): string => {
    const tokenPrice = prices[symbol];
    if (!tokenPrice) return '$1.00'; // Fallback
    
    return tokenPrice.formattedPrice;
  }, [prices]);

  const getPriceChangeForToken = useCallback((symbol: string): { change: number; isPositive: boolean } => {
    // This would need historical data implementation
    // For now, return mock data
    const mockChanges: Record<string, number> = {
      'WETH': 2.45,
      'SUI': -1.23,
      'WBTC': 3.67,
      'USDC': 0.01,
      'USDT': -0.02,
    };
    
    const change = mockChanges[symbol.toUpperCase()] || 0;
    return { change, isPositive: change >= 0 };
  }, []);

  return {
    prices,
    loading,
    error,
    getPriceForToken,
    getPriceChangeForToken,
    lastUpdated: Object.values(prices)[0]?.lastUpdated
  };
};

/**
 * Hook to calculate estimated output with Pyth prices (fallback to OKX if needed)
 */
export const useEstimatedOutput = (
  sourceToken: string,
  targetToken: string,
  amount: string,
  mode: 'same-chain' | 'cross-chain' = 'same-chain'
) => {
  const { conversion, loading: pythLoading, error: pythError } = usePythConversion(
    sourceToken,
    targetToken,
    amount,
    30000
  );

  const [fallbackData, setFallbackData] = useState<{
    estimatedOutput: string;
    currentRate: string;
    priceImpact: string;
  } | null>(null);

  // Fallback calculation if Pyth fails or for cross-chain
  useEffect(() => {
    if (pythError || mode === 'cross-chain' || !conversion) {
      // Use simplified fallback calculation
      const numAmount = parseFloat(amount || '0');
      let fallbackRate = 1;
      
      if (mode === 'cross-chain') {
        // Cross-chain rates (mock)
        fallbackRate = sourceToken === 'SUI' ? 1322.45 : 0.000756;
      } else {
        // Same-chain rates (mock)
        fallbackRate = 2.45;
      }
      
      setFallbackData({
        estimatedOutput: (numAmount * fallbackRate).toFixed(6),
        currentRate: fallbackRate.toFixed(6),
        priceImpact: '< 0.1%'
      });
    }
  }, [pythError, mode, conversion, amount, sourceToken]);

  if (conversion && !pythError) {
    return {
      estimatedOutput: conversion.estimatedOutput.toFixed(6),
      currentRate: conversion.rate.toFixed(6),
      priceImpact: '< 0.1%',
      loading: pythLoading,
      error: null,
      source: 'pyth'
    };
  }

  return {
    estimatedOutput: fallbackData?.estimatedOutput || '0.000000',
    currentRate: fallbackData?.currentRate || '1.000000',
    priceImpact: fallbackData?.priceImpact || '< 0.1%',
    loading: pythLoading,
    error: pythError,
    source: 'fallback'
  };
};
