 
import { useState, useEffect } from 'react';
import { useReadContract } from 'wagmi';
import { CONTRACTS, INTENT_RFQ_ABI } from '@/lib/contracts';
import { orderAPI } from '@/lib/api';

export function useOrderStatus(intentId: string | null) {
  const [status, setStatus] = useState<string>('UNKNOWN');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check on-chain status
  const { data: onChainRoots } = useReadContract({
    address: CONTRACTS.BASE.IntentRFQ,
    abi: INTENT_RFQ_ABI,
    functionName: 'getStatusRoots',
    enabled: !!intentId
  } as any);

  useEffect(() => {
    if (!intentId) return;

    const checkStatus = async () => {
      setIsLoading(true);
      try {
        // First check database
        const orders = await orderAPI.getAllOrders();
        const order = orders.find((o: any) => o.intentId === intentId);
        
        if (order) {
          setStatus(order.status);
          
          // If pending, check for updates
          if (order.status === 'PENDING' && onChainRoots) {
            // Here you would verify against Merkle roots
            // This requires merkle proof generation/verification
            console.log('Checking merkle roots for status update');
          }
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    checkStatus();
    
    // Poll for updates every 10 seconds
    const interval = setInterval(checkStatus, 10000);
    return () => clearInterval(interval);
  }, [intentId, onChainRoots]);

  return { status, isLoading, error };
}
