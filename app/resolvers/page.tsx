"use client"

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, TrendingUp, Clock, Shield, Zap, Activity, DollarSign, AlertCircle, CheckCircle, Eye, Brain, BarChart3 } from 'lucide-react';

const ResolversPage = () => {
  const [selectedResolver, setSelectedResolver] = useState(null);
  const [viewMode, setViewMode] = useState('leaderboard');

  const mockResolvers = [
    {
      id: 'resolver-alpha',
      name: 'Resolver Alpha',
      status: 'active',
      aiStatus: 'Analyzing market conditions across 5 chains...',
      performance: {
        successRate: 99.2,
        totalVolume: '$2.4M',
        avgExecutionTime: '28s',
        ordersCompleted: 1247,
        profit24h: '$1,240',
        rank: 1
      },
      inventory: {
        sui: { amount: '50,000', value: '$122,500', status: 'optimal' },
        ethereum: { amount: '75.5 ETH', value: '$244,620', status: 'optimal' },
        usdc: { amount: '125,000', value: '$125,000', status: 'low' },
        usdt: { amount: '89,500', value: '$89,500', status: 'optimal' }
      },
      recentActivity: [
        { time: '2m ago', action: 'Executed SUI→USDC swap', amount: '500 SUI', profit: '+$12.50' },
        { time: '5m ago', action: 'Checking inventory levels', amount: 'ETH chain', profit: null },
        { time: '8m ago', action: 'Rate analysis complete', amount: 'All pairs', profit: null },
        { time: '12m ago', action: 'Executed ETH→SUI swap', amount: '1.2 ETH', profit: '+$38.40' }
      ],
      aiInsights: [
        'Detected 15% increase in SUI→USDC volume trend',
        'Optimizing USDC inventory across Ethereum and Arbitrum',
        'Market volatility suggests holding larger ETH reserves',
        'Profitable arbitrage opportunity identified: ETH→SUI'
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'analyzing': return 'text-blue-400';
      case 'maintenance': return 'text-yellow-400';
      default: return 'text-slate-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle size={16} />;
      case 'analyzing': return <Brain size={16} className="animate-pulse" />;
      case 'maintenance': return <AlertCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-7xl mx-auto px-4 md:px-10 py-8">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            AI Resolver Network
          </h1>
          <p className="text-slate-400 text-lg">
            Monitor intelligent agents executing cross-chain swaps with precision
          </p>
        </motion.div>

        <motion.div
          className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h3 className="text-xl font-bold text-white mb-6">Active Resolvers</h3>
          <div className="grid grid-cols-1 gap-4">
            {mockResolvers.map((resolver, index) => (
              <div key={resolver.id} className="bg-slate-700/30 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <Bot size={20} className="text-white" />
                    </div>
                    <div>
                      <div className="text-white font-bold text-lg">{resolver.name}</div>
                      <div className={`flex items-center gap-2 ${getStatusColor(resolver.status)}`}>
                        {getStatusIcon(resolver.status)}
                        <span className="text-sm capitalize">{resolver.status}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-slate-400 text-sm">Rank</div>
                    <div className="text-2xl font-bold text-white">#{resolver.performance.rank}</div>
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2 text-blue-400 text-sm mb-1">
                    <Brain size={14} />
                    <span>AI Status</span>
                  </div>
                  <div className="text-white text-sm">{resolver.aiStatus}</div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center">
                    <div className="text-white font-bold">{resolver.performance.successRate}%</div>
                    <div className="text-slate-400 text-xs">Success Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-bold">{resolver.performance.totalVolume}</div>
                    <div className="text-slate-400 text-xs">Total Volume</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-bold">{resolver.performance.avgExecutionTime}</div>
                    <div className="text-slate-400 text-xs">Avg Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-bold">{resolver.performance.ordersCompleted}</div>
                    <div className="text-slate-400 text-xs">Orders</div>
                  </div>
                  <div className="text-center">
                    <div className="text-green-400 font-bold">{resolver.performance.profit24h}</div>
                    <div className="text-slate-400 text-xs">24h Profit</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResolversPage;