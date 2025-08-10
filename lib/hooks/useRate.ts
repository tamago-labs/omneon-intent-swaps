import { useState, useEffect, useCallback } from 'react';
import { RateService, RateQuote, FRONTEND_CHAIN_IDS, FRONTEND_TOKEN_ADDRESSES } from '../rate-service';

interface UseRateOptions {
  sourceChain: string;
  sourceToken: string;
  targetChain: string;
  targetToken: string;
  amount: string;
  refreshInterval?: number;
  enabled?: boolean;
}

interface RateData {
  quote: RateQuote | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export function useRate(options: UseRateOptions): RateData & {
  refresh: () => Promise<void>;
} {
  const [quote, setQuote] = useState<RateQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const rateService = new RateService();

  const fetchRate = useCallback(async () => {
    if (!options.enabled || !options.amount || parseFloat(options.amount) <= 0) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const chainId = FRONTEND_CHAIN_IDS[options.sourceChain as keyof typeof FRONTEND_CHAIN_IDS];
      const tokenAddresses = FRONTEND_TOKEN_ADDRESSES[options.sourceChain as keyof typeof FRONTEND_TOKEN_ADDRESSES];
      
      if (!chainId || !tokenAddresses) {
        throw new Error(`Unsupported chain: ${options.sourceChain}`);
      }

      const fromTokenAddress = tokenAddresses[options.sourceToken as keyof typeof tokenAddresses];
      const toTokenAddress = tokenAddresses[options.targetToken as keyof typeof tokenAddresses];

      if (!fromTokenAddress || !toTokenAddress) {
        throw new Error(`Unsupported token pair: ${options.sourceToken} -> ${options.targetToken}`);
      }

      // Convert amount to base units (assuming 18 decimals for now)
      const decimals = options.sourceToken === 'USDC' || options.sourceToken === 'USDT' ? 6 : 
                      options.sourceToken === 'WBTC' ? 8 : 
                      options.sourceToken === 'SUI' ? 9 : 18;
      
      const amountInBaseUnits = rateService.toBaseUnits(options.amount, decimals);

      const quoteResult = await rateService.getQuote({
        chainId,
        fromTokenAddress,
        toTokenAddress,
        amount: amountInBaseUnits,
        slippage: '0.005'
      });

      setQuote(quoteResult);
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error('Failed to fetch rate:', err);
      setError(err.message || 'Failed to fetch rate');
      setQuote(null);
    } finally {
      setLoading(false);
    }
  }, [
    options.sourceChain,
    options.sourceToken,
    options.targetChain,
    options.targetToken,
    options.amount,
    options.enabled
  ]);

  // Initial fetch and refresh interval
  useEffect(() => {
    if (options.enabled !== false) {
      fetchRate();

      if (options.refreshInterval && options.refreshInterval > 0) {
        const interval = setInterval(fetchRate, options.refreshInterval);
        return () => clearInterval(interval);
      }
    }
  }, [fetchRate, options.refreshInterval, options.enabled]);

  return {
    quote,
    loading,
    error,
    lastUpdated,
    refresh: fetchRate
  };
}

// Hook for getting multiple rates at once
export function useMultipleRates(
  requests: UseRateOptions[],
  refreshInterval?: number
): {
  quotes: (RateQuote | null)[];
  loading: boolean;
  errors: (string | null)[];
  refresh: () => Promise<void>;
} {
  const [quotes, setQuotes] = useState<(RateQuote | null)[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<(string | null)[]>([]);

  const rateService = new RateService();

  const fetchRates = useCallback(async () => {
    if (requests.length === 0) return;

    setLoading(true);

    try {
      const quoteRequests = requests.map(options => {
        const chainId = FRONTEND_CHAIN_IDS[options.sourceChain as keyof typeof FRONTEND_CHAIN_IDS];
        const tokenAddresses = FRONTEND_TOKEN_ADDRESSES[options.sourceChain as keyof typeof FRONTEND_TOKEN_ADDRESSES];
        
        if (!chainId || !tokenAddresses) {
          throw new Error(`Unsupported chain: ${options.sourceChain}`);
        }

        const fromTokenAddress = tokenAddresses[options.sourceToken as keyof typeof tokenAddresses];
        const toTokenAddress = tokenAddresses[options.targetToken as keyof typeof tokenAddresses];

        if (!fromTokenAddress || !toTokenAddress) {
          throw new Error(`Unsupported token pair: ${options.sourceToken} -> ${options.targetToken}`);
        }

        const decimals = options.sourceToken === 'USDC' || options.sourceToken === 'USDT' ? 6 : 
                        options.sourceToken === 'WBTC' ? 8 : 
                        options.sourceToken === 'SUI' ? 9 : 18;
        
        const amountInBaseUnits = rateService.toBaseUnits(options.amount, decimals);

        return {
          chainId,
          fromTokenAddress,
          toTokenAddress,
          amount: amountInBaseUnits,
          slippage: '0.005'
        };
      });

      const results = await rateService.getMultipleQuotes(quoteRequests);
      setQuotes(results);
      setErrors(results.map(() => null));
    } catch (err: any) {
      console.error('Failed to fetch multiple rates:', err);
      setErrors(requests.map(() => err.message || 'Failed to fetch rate'));
      setQuotes(requests.map(() => null));
    } finally {
      setLoading(false);
    }
  }, [requests]);

  useEffect(() => {
    fetchRates();

    if (refreshInterval && refreshInterval > 0) {
      const interval = setInterval(fetchRates, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchRates, refreshInterval]);

  return {
    quotes,
    loading,
    errors,
    refresh: fetchRates
  };
}
