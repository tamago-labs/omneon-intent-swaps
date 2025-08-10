// API service for fetching real-time rates from OKX DEX - Frontend version
export interface RateQuote {
    fromToken: {
      symbol: string;
      amount: string;
      decimals: number;
      price: string;
    };
    toToken: {
      symbol: string;
      amount: string;
      decimals: number;
      price: string;
    };
    rate: string;
    priceImpact: string;
    gasEstimate?: string;
    route?: string[];
  }
  
  export class RateService {
    private baseUrl = 'https://www.okx.com/api/v5/dex/aggregator';
  
    async getQuote(params: {
      chainId: string;
      fromTokenAddress: string;
      toTokenAddress: string;
      amount: string;
      slippage?: string;
    }): Promise<RateQuote> {
      try {
        console.log(`Fetching quote from OKX API for chain ${params.chainId}`);
        
        const url = `${this.baseUrl}/quote`;
        const queryParams = new URLSearchParams({
          chainId: params.chainId,
          fromTokenAddress: params.fromTokenAddress,
          toTokenAddress: params.toTokenAddress,
          amount: params.amount,
          slippage: params.slippage || '0.005'
        });
  
        const response = await fetch(`${url}?${queryParams}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        const data = await response.json();
        
        if (data.code !== '0' || !data.data || data.data.length === 0) {
          throw new Error(data.msg || 'No quote data available from OKX');
        }
  
        const quote = data.data[0];
        
        return {
          fromToken: {
            symbol: quote.fromToken.tokenSymbol,
            amount: quote.fromToken.amount,
            decimals: parseInt(quote.fromToken.decimal),
            price: quote.fromToken.tokenUnitPrice
          },
          toToken: {
            symbol: quote.toToken.tokenSymbol,
            amount: quote.toToken.amount,
            decimals: parseInt(quote.toToken.decimal),
            price: quote.toToken.tokenUnitPrice
          },
          rate: this.calculateRate(quote.fromToken.amount, quote.toToken.amount),
          priceImpact: quote.priceImpact || '0',
          gasEstimate: quote.estimateGasFee,
          route: quote.routerResult?.map((r: any) => r.dexName) || []
        };
      } catch (error: any) {
        console.error('Error fetching quote from OKX:', error);
        
        // Return fallback data for development - you might want to remove this in production
        return this.getFallbackQuote(params);
      }
    }
  
    private getFallbackQuote(params: {
      chainId: string;
      fromTokenAddress: string;
      toTokenAddress: string;
      amount: string;
    }): RateQuote {
      console.log('Using fallback quote data');
      
      // Simple fallback rates
      const mockRates: Record<string, number> = {
        'WETH-USDC': 3200,
        'USDC-WETH': 0.0003125,
        'SUI-USDC': 2.45,
        'USDC-SUI': 0.408,
        'WETH-WBTC': 0.052,
        'WBTC-WETH': 19.2
      };
  
      // Extract token symbols from addresses (simplified)
      const fromSymbol = this.getTokenSymbolFromAddress(params.fromTokenAddress);
      const toSymbol = this.getTokenSymbolFromAddress(params.toTokenAddress);
      const rateKey = `${fromSymbol}-${toSymbol}`;
      const rate = mockRates[rateKey] || 1;
      
      const inputAmount = parseFloat(params.amount);
      const outputAmount = inputAmount * rate;
      
      return {
        fromToken: {
          symbol: fromSymbol,
          amount: params.amount,
          decimals: 18,
          price: '1.0'
        },
        toToken: {
          symbol: toSymbol,
          amount: outputAmount.toString(),
          decimals: 18,
          price: '1.0'
        },
        rate: rate.toString(),
        priceImpact: '0.1',
        gasEstimate: params.chainId === '784' ? '0.001' : '0.005',
        route: ['Fallback DEX']
      };
    }
  
    private getTokenSymbolFromAddress(address: string): string {
      // Simplified token symbol extraction
      if (address.includes('WETH') || address.includes('weth')) return 'WETH';
      if (address.includes('USDC') || address.includes('usdc')) return 'USDC';
      if (address.includes('USDT') || address.includes('usdt')) return 'USDT';
      if (address.includes('WBTC') || address.includes('wbtc')) return 'WBTC';
      if (address.includes('SUI') || address.includes('sui')) return 'SUI';
      return 'UNKNOWN';
    }
  
    async getMultipleQuotes(requests: Array<{
      chainId: string;
      fromTokenAddress: string;
      toTokenAddress: string;
      amount: string;
      slippage?: string;
    }>): Promise<RateQuote[]> {
      const promises = requests.map(request => 
        this.getQuote(request).catch(error => {
          console.error(`Quote failed for ${request.fromTokenAddress} -> ${request.toTokenAddress}:`, error);
          return null;
        })
      );
  
      const results = await Promise.all(promises);
      return results.filter((quote): quote is RateQuote => quote !== null);
    }
  
    private calculateRate(fromAmount: string, toAmount: string): string {
      const from = parseFloat(fromAmount);
      const to = parseFloat(toAmount);
      
      if (from === 0) return '0';
      
      return (to / from).toFixed(6);
    }
  
    // Helper function to format amounts for display
    formatAmount(amount: string, decimals: number): string {
      const divisor = Math.pow(10, decimals);
      const value = parseFloat(amount) / divisor;
      return value.toFixed(6);
    }
  
    // Convert human readable amount to base units
    toBaseUnits(amount: string, decimals: number): string {
      const [integerPart, decimalPart = ''] = amount.split('.');
      const currentDecimals = decimalPart.length;
  
      let result = integerPart + decimalPart;
  
      if (currentDecimals < decimals) {
        result = result + '0'.repeat(decimals - currentDecimals);
      } else if (currentDecimals > decimals) {
        result = result.slice(0, result.length - (currentDecimals - decimals));
      }
  
      result = result.replace(/^0+/, '') || '0';
      return result;
    }
  }
  
  // Chain ID mapping for frontend
  export const FRONTEND_CHAIN_IDS = {
    'Ethereum': '1',
    'Base': '8453',
    'Optimism': '10',
    'SUI': '784'
  };
  
  // Token addresses for frontend rate fetching
  export const FRONTEND_TOKEN_ADDRESSES = {
    'Ethereum': {
      'WETH': '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      'USDC': '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      'USDT': '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      'WBTC': '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'
    },
    'Base': {
      'WETH': '0x4200000000000000000000000000000000000006',
      'USDC': '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      'USDT': '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2',
      'WBTC': '0x0555E30da8f98308EdB960aa94C0Db47230d2B9c'
    },
    'Optimism': {
      'WETH': '0x4200000000000000000000000000000000000006',
      'USDC': '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
      'WBTC': '0x68f180fcCe6836688e9084f035309E29Bf0A2095'
    },
    'SUI': {
      'SUI': '0x2::sui::SUI',
      'WETH': '0xd0e89b2af5e4910726fbcd8b8dd37bb79b29e5f83f7491bca830e94f7f226d29::eth::ETH',
      'USDC': '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC',
      'USDT': '0x375f70cf2ae4c00bf37117d0c85a2c71545e6ee05c4a5c7d282cd66a4504b068::usdt::USDT',
      'WBTC': '0xaafb102dd0902f5055cadecd687fb5b71ca82ef0e0285d90afde828ec58ca96b::btc::BTC'
    }
  };