import { useState, useEffect } from 'react';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { SUI_TOKENS, formatSuiAmount } from './contracts';

// Create a shared client instance to avoid multiple connections
// Explicitly use testnet URL to avoid any mainnet connections
const TESTNET_URL = 'https://fullnode.testnet.sui.io:443';
console.log('SUI Client connecting to:', TESTNET_URL);
const suiClient = new SuiClient({ url: TESTNET_URL });

// Test the client connection
suiClient.getLatestSuiSystemState().then(() => {
  console.log('✅ SUI Client successfully connected to testnet');
}).catch((error) => {
  console.error('❌ SUI Client connection failed:', error);
});

export function useSuiTokenBalances(address: string | null) {
  const [balances, setBalances] = useState<{ [symbol: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalances = async () => {
    if (!address) {
      setBalances({});
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Fetching SUI balances for address:', address);
      const newBalances: { [symbol: string]: string } = {};

      for (const token of SUI_TOKENS.TESTNET) {
        try {
          console.log(`Fetching balance for ${token.symbol} (${token.type})`);
          
          const coinData = await suiClient.getBalance({
            owner: address,
            coinType: token.type,
          });

          console.log(`${token.symbol} balance data:`, coinData);
          
          // Get actual decimals from coin metadata if possible
          let decimals = token.decimals;
          try {
            const metadata = await suiClient.getCoinMetadata({ coinType: token.type });
            if (metadata && metadata.decimals !== null) {
              decimals = metadata.decimals;
              console.log(`${token.symbol} actual decimals:`, decimals);
            }
          } catch (metadataError) {
            console.warn(`Could not fetch metadata for ${token.symbol}, using default decimals:`, decimals);
          }

          const balance = formatSuiAmount(coinData.totalBalance, decimals);
          newBalances[token.symbol] = balance;
          console.log(`${token.symbol} formatted balance:`, balance);
        } catch (tokenError) {
          console.warn(`Error fetching ${token.symbol} balance:`, tokenError);
          newBalances[token.symbol] = '0.000000';
        }
      }

      setBalances(newBalances);
      console.log('Final balances:', newBalances);
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

// Helper function to get token decimals
export async function getTokenDecimals(tokenType: string): Promise<number> {
  try {
    const metadata = await suiClient.getCoinMetadata({ coinType: tokenType });
    if (metadata && metadata.decimals !== null) {
      return metadata.decimals;
    }
  } catch (error) {
    console.warn(`Could not fetch decimals for ${tokenType}:`, error);
  }
  
  // Fallback to default decimals
  if (tokenType === '0x2::sui::SUI') {
    return 9;
  }
  return 9; // Default for custom tokens
}

// Export the shared client for use in other hooks
export { suiClient };
