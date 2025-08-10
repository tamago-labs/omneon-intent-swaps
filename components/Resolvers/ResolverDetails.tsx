"use client"

import React from 'react';
import { motion } from 'framer-motion';
import { X, Bot, Globe, Mail, MessageCircle, Twitter, TrendingUp, Activity, Clock, DollarSign, Award, Target } from 'lucide-react';
import { Resolver, Order } from '@/lib/api';
import { utils } from '@/lib/api';

interface ResolverDetailsProps {
  resolver: Resolver;
  orders: Order[];
  onClose: () => void;
}

const ResolverDetails: React.FC<ResolverDetailsProps> = ({ resolver, orders, onClose }) => {
  const completedOrders = orders.filter(order => order.status === 'COMPLETED');
  const pendingOrders = orders.filter(order => order.status === 'PENDING');
  const failedOrders = orders.filter(order => order.status === 'FAILED');

  // Calculate 24h stats
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const orders24h = orders.filter(order => new Date(order.createdAt) >= yesterday);
  const volume24h = orders24h
    .filter(order => order.status === 'COMPLETED')
    .reduce((sum, order) => sum + parseFloat(order.amountIn || '0'), 0);

  // Calculate average execution time
  const executionTimes = completedOrders
    .filter(order => order.createdAt && order.completedAt)
    .map(order => {
      const created = new Date(order.createdAt).getTime();
      const completed = new Date(order.completedAt!).getTime();
      return (completed - created) / 1000;
    });
  
  const avgExecutionTime = executionTimes.length > 0 
    ? executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length 
    : 0;

  // Recent orders (last 10)
  const recentOrders = orders
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'text-green-400 bg-green-400/10';
      case 'PENDING': return 'text-yellow-400 bg-yellow-400/10';
      case 'FAILED': return 'text-red-400 bg-red-400/10';
      case 'CANCELLED': return 'text-gray-400 bg-gray-400/10';
      default: return 'text-slate-400 bg-slate-400/10';
    }
  };

  const getReputationColor = (reputation: number) => {
    if (reputation >= 900) return 'text-emerald-400';
    if (reputation >= 700) return 'text-blue-400';
    if (reputation >= 500) return 'text-yellow-400';
    return 'text-red-400';
  };

  const formatVolume = (volume: string | number) => {
    const value = typeof volume === 'string' ? parseFloat(volume) : volume;
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(2)}K`;
    }
    return `$${value.toFixed(2)}`;
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-slate-800 rounded-2xl border border-slate-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Bot size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{resolver.name}</h2>
              <div className="flex items-center gap-4 mt-1">
                <span className="flex items-center gap-1 text-slate-400 text-sm">
                  <Globe size={14} />
                  {resolver.country}
                </span>
                {resolver.isActive ? (
                  <span className="px-2 py-1 bg-green-400/10 text-green-400 text-xs rounded-md">
                    Active
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-red-400/10 text-red-400 text-xs rounded-md">
                    Inactive
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="p-6">
          {/* Description */}
          {resolver.description && (
            <div className="mb-6">
              <p className="text-slate-300">{resolver.description}</p>
            </div>
          )}

          {/* Contact Info */}
          <div className="flex flex-wrap gap-4 mb-6">
            {resolver.website && (
              <a
                href={resolver.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 bg-slate-700/50 rounded-lg text-blue-400 hover:bg-slate-700 transition-colors"
              >
                <Globe size={16} />
                Website
              </a>
            )}
            {resolver.email && (
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-700/50 rounded-lg text-slate-400">
                <Mail size={16} />
                Contact Available
              </div>
            )}
            {resolver.telegram && (
              <a
                href={`https://t.me/${resolver.telegram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 bg-slate-700/50 rounded-lg text-blue-400 hover:bg-slate-700 transition-colors"
              >
                <MessageCircle size={16} />
                Telegram
              </a>
            )}
            {resolver.twitter && (
              <a
                href={`https://twitter.com/${resolver.twitter}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 bg-slate-700/50 rounded-lg text-blue-400 hover:bg-slate-700 transition-colors"
              >
                <Twitter size={16} />
                Twitter
              </a>
            )}
          </div>
 

          {/* Supported Chains */}
          {resolver.supportedChains && resolver.supportedChains.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Supported Chains</h3>
              <div className="flex flex-wrap gap-2">
                {resolver.supportedChains.map((chain) => (
                  <span
                    key={chain}
                    className="px-3 py-1 bg-slate-700/50 text-slate-300 text-sm rounded-md"
                  >
                    {chain}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recent Orders */}
          {recentOrders.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Recent Orders</h3>
              <div className="space-y-2">
                {recentOrders.map((order) => (
                  <div
                    key={order.intentId}
                    className="bg-slate-700/30 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm text-slate-400">
                        {order.sourceChainType} → {order.destChainType}
                      </div>
                      <div className={`px-2 py-1 rounded-md text-xs ${getStatusColor(order.status)}`}>
                        {order.status}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-white">
                        {utils.formatAmount(order.amountIn, order.sourceTokenDecimals)} {order.sourceTokenSymbol}
                        {order.actualAmountOut && (
                          <span className="text-slate-400">
                            → {utils.formatAmount(order.actualAmountOut, order.destTokenDecimals)} {order.destTokenSymbol}
                          </span>
                        )}
                      </div>
                      <div className="text-slate-400 text-sm">
                        {utils.formatTimeAgo(order.createdAt)}
                      </div>
                    </div>
                    {order.txHashSource && (
                      <div className="text-xs text-slate-500 mt-1">
                        TX: {order.txHashSource.slice(0, 10)}...{order.txHashSource.slice(-8)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ResolverDetails;
