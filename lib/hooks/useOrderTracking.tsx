 
import { useState, useEffect } from 'react';
import { orderAPI } from '@/lib/api';

export function useOrderTracking(userAddress: string | undefined) {
  
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userAddress) return;

    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const userId = `${userAddress.toLowerCase()}_0`; // Assuming EVM chain
        const userOrders = await orderAPI.getOrdersByUser(userId);
        setOrders(userOrders);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [userAddress]);

  const updateOrderStatus = async (intentId: string, newStatus: string) => {
    try {
      await orderAPI.updateOrder(intentId, { 
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      
      // Refresh orders
      const userId = `${userAddress?.toLowerCase()}_0`;
      const updatedOrders = await orderAPI.getOrdersByUser(userId);
      setOrders(updatedOrders);
    } catch (err: any) {
      console.error('Error updating order status:', err);
    }
  };

  return {
    orders,
    isLoading,
    error,
    updateOrderStatus
  };
}