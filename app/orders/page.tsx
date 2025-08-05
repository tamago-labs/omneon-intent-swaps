"use client"

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, XCircle, AlertTriangle, Eye, Filter, Search, Bot, Zap, TrendingUp } from 'lucide-react';

const OrdersPage = () => {
  const [selectedFilter, setSelectedFilter] = useState<any>('all');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState<any>('');

  const mockOrders = [
    {
      id: 'ORD-001',
      type: 'SUI → USDC',
      amount: '100 SUI',
      targetAmount: '245 USDC',
      sourceChain: 'SUI',
      targetChain: 'Ethereum',
      status: 'executing',
      condition: 'when rate hits $2.50',
      created: '2025-01-15 14:30:22',
      resolver: 'Resolver Alpha',
      resolverStatus: 'Checking SUI balance in user wallet...',
      progress: 25,
      executionSteps: [
        { step: 'Intent created', status: 'completed', timestamp: '14:30:22' },
        { step: 'Resolver assigned', status: 'completed', timestamp: '14:30:45' },
        { step: 'Checking user balance', status: 'active', timestamp: '14:31:02' },
        { step: 'Verifying rate condition', status: 'pending', timestamp: null },
        { step: 'Execute cross-chain swap', status: 'pending', timestamp: null },
      ],
      partialFills: [
        { amount: '25 SUI', price: '$2.48', resolver: 'Alpha', timestamp: '14:31:15' }
      ]
    },
    {
      id: 'ORD-002',
      type: 'ETH → SUI',
      amount: '0.5 ETH',
      targetAmount: '656 SUI',
      sourceChain: 'Ethereum',
      targetChain: 'SUI',
      status: 'completed',
      condition: 'immediately at market rate',
      created: '2025-01-15 13:45:10',
      resolver: 'Resolver Beta',
      resolverStatus: 'Successfully executed cross-chain swap',
      progress: 100,
      executionSteps: [
        { step: 'Intent created', status: 'completed', timestamp: '13:45:10' },
        { step: 'Resolver assigned', status: 'completed', timestamp: '13:45:12' },
        { step: 'Balance verified', status: 'completed', timestamp: '13:45:18' },
        { step: 'Rate condition met', status: 'completed', timestamp: '13:45:20' },
        { step: 'Cross-chain swap executed', status: 'completed', timestamp: '13:45:55' },
      ],
      partialFills: [
        { amount: '0.5 ETH', price: '$3,240', resolver: 'Beta', timestamp: '13:45:55' }
      ]
    },
    {
      id: 'ORD-003',
      type: 'SUI → ETH',
      amount: '1000 SUI',
      targetAmount: '0.756 ETH',
      sourceChain: 'SUI',
      targetChain: 'Ethereum',
      status: 'partial',
      condition: 'when rate hits $2.45',
      created: '2025-01-15 12:20:15',
      resolver: 'Resolver Gamma',
      resolverStatus: 'Partially filled. Waiting for better rates for remaining amount...',
      progress: 60,
      executionSteps: [
        { step: 'Intent created', status: 'completed', timestamp: '12:20:15' },
        { step: 'Resolver assigned', status: 'completed', timestamp: '12:20:18' },
        { step: 'Partial execution (60%)', status: 'completed', timestamp: '12:45:30' },
        { step: 'Waiting for rate improvement', status: 'active', timestamp: '12:45:32' },
        { step: 'Complete remaining swap', status: 'pending', timestamp: null },
      ],
      partialFills: [
        { amount: '400 SUI', price: '$2.46', resolver: 'Gamma', timestamp: '12:25:45' },
        { amount: '200 SUI', price: '$2.45', resolver: 'Alpha', timestamp: '12:45:30' }
      ]
    },
    {
      id: 'ORD-004',
      type: 'USDC → SUI',
      amount: '500 USDC',
      targetAmount: '204 SUI',
      sourceChain: 'Ethereum',
      targetChain: 'SUI',
      status: 'failed',
      condition: 'within next 24 hours',
      created: '2025-01-14 16:10:30',
      resolver: 'Resolver Alpha',
      resolverStatus: 'Order expired. Rate condition not met within timeframe.',
      progress: 0,
      executionSteps: [
        { step: 'Intent created', status: 'completed', timestamp: '16:10:30' },
        { step: 'Resolver assigned', status: 'completed', timestamp: '16:10:32' },
        { step: 'Monitoring rate condition', status: 'failed', timestamp: '16:10:30 (+24h)' },
      ],
      partialFills: []
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'executing': return 'text-blue-400';
      case 'partial': return 'text-yellow-400';
      case 'failed': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle size={16} />;
      case 'executing': return <Clock size={16} className="animate-spin" />;
      case 'partial': return <AlertTriangle size={16} />;
      case 'failed': return <XCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const filteredOrders = mockOrders.filter(order => {
    const matchesFilter = selectedFilter === 'all' || order.status === selectedFilter;
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
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
          <p className="text-slate-400 text-lg">
            Track your intent orders and resolver execution progress
          </p>
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
              { key: 'executing', label: 'Executing' },
              { key: 'completed', label: 'Completed' },
              { key: 'partial', label: 'Partial' },
              { key: 'failed', label: 'Failed' }
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

        {/* Orders List */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {filteredOrders.map((order: any, index: number) => (
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
                  <span className="text-white font-medium">{order.id}</span>
                </div>
                <button className="text-slate-400 hover:text-white transition-colors">
                  <Eye size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <div className="text-slate-400 text-sm mb-1">Trading</div>
                  <div className="text-white font-medium">{order.type}</div>
                  <div className="text-slate-300 text-sm">{order.amount} → {order.targetAmount}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-sm mb-1">Chains</div>
                  <div className="text-white font-medium">{order.sourceChain} → {order.targetChain}</div>
                  <div className="text-slate-300 text-sm">{order.condition}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-sm mb-1">Resolver</div>
                  <div className="text-white font-medium flex items-center gap-2">
                    <Bot size={16} className="text-blue-400" />
                    {order.resolver}
                  </div>
                  <div className="text-slate-300 text-sm">{order.created}</div>
                </div>
              </div>

              {/* Resolver Status */}
              <div className="bg-slate-700/30 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 text-blue-400 text-sm mb-2">
                  <Bot size={14} />
                  AI Resolver Status
                </div>
                <div className="text-white text-sm">{order.resolverStatus}</div>
              </div>

              {/* Progress Bar */}
              {order.status === 'executing' || order.status === 'partial' ? (
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Progress</span>
                    <span className="text-white">{order.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${order.progress}%` }}
                    />
                  </div>
                </div>
              ) : null}

              {/* Partial Fills */}
              {order.partialFills.length > 0 && (
                <div>
                  <div className="text-slate-400 text-sm mb-2">Partial Fills ({order.partialFills.length})</div>
                  <div className="space-y-2">
                    {order.partialFills.slice(0, 2).map((fill: any, fillIndex: number) => (
                      <div key={fillIndex} className="flex items-center justify-between text-sm bg-slate-700/20 rounded p-2">
                        <span className="text-white">{fill.amount}</span>
                        <span className="text-green-400">{fill.price}</span>
                        <span className="text-slate-400">{fill.resolver}</span>
                        <span className="text-slate-400">{fill.timestamp}</span>
                      </div>
                    ))}
                    {order.partialFills.length > 2 && (
                      <div className="text-center text-slate-400 text-sm">
                        +{order.partialFills.length - 2} more fills
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {filteredOrders.length === 0 && (
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
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  ×
                </button>
              </div>

              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="text-slate-400 text-sm mb-1">Order ID</div>
                  <div className="text-white font-medium">{selectedOrder.id}</div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="text-slate-400 text-sm mb-1">Status</div>
                  <div className={`font-medium flex items-center gap-2 ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusIcon(selectedOrder.status)}
                    <span className="capitalize">{selectedOrder.status}</span>
                  </div>
                </div>
              </div>

              {/* Execution Timeline */}
              <div className="mb-6">
                <h4 className="text-white font-medium mb-4">Execution Timeline</h4>
                <div className="space-y-3">
                  {selectedOrder.executionSteps.map((step: any, index: number) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        step.status === 'completed' ? 'bg-green-400' :
                        step.status === 'active' ? 'bg-blue-400' :
                        step.status === 'failed' ? 'bg-red-400' : 'bg-slate-600'
                      }`} />
                      <div className="flex-1">
                        <div className="text-white text-sm">{step.step}</div>
                        {step.timestamp && (
                          <div className="text-slate-400 text-xs">{step.timestamp}</div>
                        )}
                      </div>
                      {step.status === 'active' && (
                        <div className="text-blue-400">
                          <Zap size={14} className="animate-pulse" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Current Market Conditions */}
              <div className="mb-6">
                <h4 className="text-white font-medium mb-4">Current Market Conditions</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                    <div className="text-white font-bold">$2.45</div>
                    <div className="text-slate-400 text-sm">Current Rate</div>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                    <div className="text-green-400 font-bold">+2.3%</div>
                    <div className="text-slate-400 text-sm">24h Change</div>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                    <div className="text-white font-bold">$12.5M</div>
                    <div className="text-slate-400 text-sm">24h Volume</div>
                  </div>
                </div>
              </div>

              {/* All Partial Fills */}
              {selectedOrder.partialFills.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-white font-medium mb-4">All Fills ({selectedOrder.partialFills.length})</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedOrder.partialFills.map((fill: any, fillIndex: number) => (
                      <div key={fillIndex} className="flex items-center justify-between text-sm bg-slate-700/30 rounded p-3">
                        <div className="text-white font-medium">{fill.amount}</div>
                        <div className="text-green-400">{fill.price}</div>
                        <div className="text-blue-400">{fill.resolver}</div>
                        <div className="text-slate-400">{fill.timestamp}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resolver Details */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 text-blue-400 mb-2">
                  <Bot size={16} />
                  <span className="font-medium">AI Resolver: {selectedOrder.resolver}</span>
                </div>
                <div className="text-white text-sm mb-2">{selectedOrder.resolverStatus}</div>
                {selectedOrder.status === 'executing' && (
                  <div className="flex items-center gap-2 text-slate-300 text-xs">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                    <span>Actively monitoring market conditions...</span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrdersPage;