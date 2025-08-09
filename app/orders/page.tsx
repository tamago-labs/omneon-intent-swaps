"use client"

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, XCircle, AlertTriangle, Eye, Filter, Search, Bot, Zap, TrendingUp, Wallet } from 'lucide-react';
import { useWalletType } from '@/lib/wallet-type-context';
import { orderAPI, utils } from '@/lib/api';
import { getChainType } from '@/lib/contracts';

interface Order {
  id: string;
  intentId: string;
  userId: string;
  sourceTokenSymbol: string;
  destTokenSymbol: string;
  sourceChainType: number;
  destChainType: number;
  amountIn: string;
  minAmountOut: string;
  actualAmountOut?: string;
  status: string;
  txHashSource?: string;
  txHashDest?: string;
  createdAt: string;
  executedAt?: string;
  completedAt?: string;
  expiresAt?: string;
  executionCondition?: string;
  sourceTokenDecimals: number;
  destTokenDecimals: number;
}

const OrdersPage = () => {
  const { wallets, isEVMConnected, isSUIConnected } = useWalletType();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch orders for connected wallets
  useEffect(() => {
    const fetchOrders = async () => {
      if (!isEVMConnected() && !isSUIConnected()) {
        setOrders([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log('Fetching orders for wallets:', wallets);
        
        // Get all orders and filter by connected wallet addresses
        const allOrders = await orderAPI.getAllOrders();
        console.log('All orders from database:', allOrders);
        
        // Create user IDs for both wallet types using utility function
        const userIds: any = [];
        if (wallets.evm) {
          userIds.push(utils.generateUserId(wallets.evm, getChainType('Ethereum Sepolia')));
        }
        if (wallets.sui) {
          userIds.push(utils.generateUserId(wallets.sui, getChainType('SUI')));
        }
        
        console.log('Looking for orders with userIds:', userIds);
        console.log('Sample order userIds from database:', allOrders.slice(0, 3).map(o => o.userId));
        
        // Filter orders for connected wallets
        const userOrders = allOrders.filter(order => 
          userIds.includes(order.userId)
        );
        
        console.log('Filtered user orders:', userOrders);
        setOrders(userOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [wallets.evm, wallets.sui, isEVMConnected, isSUIConnected]);

  const getChainName = (chainType: number): string => {
    switch (chainType) {
      case 0: return 'Ethereum';
      case 1: return 'SUI';
      default: return 'Unknown';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'text-green-400';
      case 'pending': return 'text-blue-400';
      case 'failed': return 'text-red-400';
      case 'cancelled': return 'text-yellow-400';
      case 'expired': return 'text-orange-400';
      default: return 'text-slate-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return <CheckCircle size={16} />;
      case 'pending': return <Clock size={16} className="animate-spin" />;
      case 'failed': return <XCircle size={16} />;
      case 'cancelled': return <AlertTriangle size={16} />;
      case 'expired': return <XCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const formatAmount = (amount: string, decimals: number): string => {
    return utils.formatAmount(amount, decimals);
  };

  const getExecutionCondition = (order: Order): string => {
    if (!order.executionCondition) return 'Immediately at market rate';
    
    try {
      const condition = JSON.parse(order.executionCondition);
      return condition.condition || 'Immediately at market rate';
    } catch {
      return 'Immediately at market rate';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesFilter = selectedFilter === 'all' || order.status.toLowerCase() === selectedFilter;
    const matchesSearch = order.intentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.sourceTokenSymbol?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.destTokenSymbol?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Show wallet connection message if no wallets connected
  if (!isEVMConnected() && !isSUIConnected()) {
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 md:px-10 py-8">
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Wallet className="mx-auto text-slate-400 mb-4" size={48} />
            <h2 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h2>
            <p className="text-slate-400 mb-4">
              Connect your EVM or SUI wallet to view your orders
            </p>
            <p className="text-slate-500 text-sm">
              You can connect both wallet types to see all your cross-chain orders
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-10 py-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Your Orders
          </h1>
          <div className="flex items-center gap-4 text-slate-400">
            <p>Track your intent orders and execution status</p>
            {/* <div className="flex items-center gap-2 text-sm">
              {isEVMConnected() && (
                <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded">EVM Connected</span>
              )}
              {isSUIConnected() && (
                <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded">SUI Connected</span>
              )}
            </div> */}
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          className="flex flex-col md:flex-row gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'All Orders' },
              { key: 'pending', label: 'Pending' },
              { key: 'completed', label: 'Completed' },
              { key: 'failed', label: 'Failed' },
              { key: 'cancelled', label: 'Cancelled' },
              { key: 'expired', label: 'Expired' }
            ].map(filter => (
              <button
                key={filter.key}
                onClick={() => setSelectedFilter(filter.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedFilter === filter.key
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
          
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <div className="text-slate-400">Loading your orders...</div>
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <XCircle className="mx-auto text-red-400 mb-4" size={48} />
            <div className="text-red-400 text-lg mb-2">{error}</div>
            <button 
              onClick={() => window.location.reload()}
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              Try again
            </button>
          </motion.div>
        )}

        {/* Orders List */}
        {!loading && !error && (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {filteredOrders.map((order: Order, index: number) => (
              <motion.div
                key={order.id}
                className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 hover:bg-slate-700/30 transition-colors cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                onClick={() => setSelectedOrder(order)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-2 ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="font-medium capitalize">{order.status}</span>
                    </div>
                    <span className="text-slate-400">•</span>
                    <span className="text-white font-medium">{order.intentId.slice(0, 8)}...</span>
                  </div> 
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <div className="text-slate-400 text-sm mb-1">Trading</div>
                    <div className="text-white font-medium">
                      {order.sourceTokenSymbol} → {order.destTokenSymbol}
                    </div>
                    <div className="text-slate-300 text-sm">
                      {formatAmount(order.amountIn, order.sourceTokenDecimals)} {order.sourceTokenSymbol} →
                      ≈ {formatAmount(order.minAmountOut, order.destTokenDecimals)} {order.destTokenSymbol}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-sm mb-1">Chains</div>
                    <div className="text-white font-medium">
                      {getChainName(order.sourceChainType)} → {getChainName(order.destChainType)}
                    </div>
                    <div className="text-slate-300 text-sm">
                      {getExecutionCondition(order)}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-sm mb-1">Created</div>
                    <div className="text-white font-medium">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-slate-300 text-sm">
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                {/* Transaction Hashes */}
                {order.txHashSource && (
                  <div className="bg-slate-700/30 rounded-lg p-3">
                    <div className="text-slate-400 text-sm mb-2">Transaction Hash</div>
                    <div className="text-blue-400 text-sm font-mono break-all">
                      {order.txHashSource}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}

        {!loading && !error && filteredOrders.length === 0 && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="text-slate-400 text-lg mb-2">No orders found</div>
            <div className="text-slate-500">Try adjusting your filters or create a new intent order</div>
          </motion.div>
        )}
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              className="bg-slate-800 rounded-2xl border border-slate-600 p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Order Details</h3>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="text-slate-400 hover:text-white transition-colors text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Order Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="text-slate-400 text-sm mb-1">Intent ID</div>
                  <div className="text-white font-medium font-mono text-sm break-all">
                    {selectedOrder.intentId}
                  </div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="text-slate-400 text-sm mb-1">Status</div>
                  <div className={`font-medium flex items-center gap-2 ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusIcon(selectedOrder.status)}
                    <span className="capitalize">{selectedOrder.status}</span>
                  </div>
                </div>
              </div>

              {/* Trading Details */}
              <div className="bg-slate-700/30 rounded-lg p-4 mb-6">
                <h4 className="text-white font-medium mb-3">Trading Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-slate-400 text-sm">From</div>
                    <div className="text-white font-medium">
                      {formatAmount(selectedOrder.amountIn, selectedOrder.sourceTokenDecimals)} {selectedOrder.sourceTokenSymbol}
                    </div>
                    <div className="text-slate-400 text-sm">on {getChainName(selectedOrder.sourceChainType)}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-sm">To (Min)</div>
                    <div className="text-white font-medium">
                      {formatAmount(selectedOrder.minAmountOut, selectedOrder.destTokenDecimals)} {selectedOrder.destTokenSymbol}
                    </div>
                    <div className="text-slate-400 text-sm">on {getChainName(selectedOrder.destChainType)}</div>
                  </div>
                </div>
              </div>

              {/* Execution Condition */}
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 text-yellow-400 mb-2">
                  <Zap size={16} />
                  <span className="font-medium">Execution Condition</span>
                </div>
                <div className="text-white">{getExecutionCondition(selectedOrder)}</div>
              </div>

              {/* Timestamps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="text-slate-400 text-sm mb-1">Created At</div>
                  <div className="text-white">
                    {new Date(selectedOrder.createdAt).toLocaleString()}
                  </div>
                </div>
                {selectedOrder.expiresAt && (
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <div className="text-slate-400 text-sm mb-1">Expires At</div>
                    <div className="text-white">
                      {new Date(selectedOrder.expiresAt).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>

              {/* Transaction Hashes */}
              {(selectedOrder.txHashSource || selectedOrder.txHashDest) && (
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-3">Transaction Hashes</h4>
                  {selectedOrder.txHashSource && (
                    <div className="mb-3">
                      <div className="text-slate-400 text-sm mb-1">Source Chain</div>
                      <div className="text-blue-400 text-sm font-mono break-all">
                        {selectedOrder.txHashSource}
                      </div>
                    </div>
                  )}
                  {selectedOrder.txHashDest && (
                    <div>
                      <div className="text-slate-400 text-sm mb-1">Destination Chain</div>
                      <div className="text-blue-400 text-sm font-mono break-all">
                        {selectedOrder.txHashDest}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrdersPage;