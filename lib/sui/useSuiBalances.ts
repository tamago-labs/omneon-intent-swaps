import { useState, useEffect } from 'react';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { SUI_TOKENS, formatSuiAmount } from './contracts';

export function useSuiTokenBalances(address: string | null) {
  const [balances, setBalances] = useState<{ [symbol: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const client = new SuiClient({ url: getFullnodeUrl('mainnet') });

  const fetchBalances = async () => {
    if (!address) {
      setBalances({});
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const newBalances: { [symbol: string]: string } = {};

      for (const token of SUI_TOKENS.MAINNET) {
        try {
          const coinData = await client.getBalance({
            owner: address,
            coinType: token.type,
          });

          const balance = formatSuiAmount(coinData.totalBalance, token.decimals);
          newBalances[token.symbol] = balance;
        } catch (tokenError) {
          console.warn(`Error fetching ${token.symbol} balance:`, tokenError);
          newBalances[token.symbol] = '0.000000';
        }
      }

      setBalances(newBalances);
    } catch (err: any) {
      console.error('Error fetching SUI balances:', err);
      setError(err.message || 'Failed to fetch balances');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, [address]);

  return {
    balances,
    isLoading,
    error,
    refetch: fetchBalances
  };
}

export function useSuiTokenBalance(address: string | null, tokenSymbol: string) {
  const { balances, isLoading, error, refetch } = useSuiTokenBalances(address);
  
  return {
    balance: balances[tokenSymbol] || '0.000000',
    isLoading,
    error,
    refetch
  };
}
