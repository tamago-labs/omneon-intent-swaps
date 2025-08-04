"use client"

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import IntentBuilderSection from '@/components/Landing/IntentBuilder';
import { TrendingUp, Clock, Shield, Zap, AlertCircle } from 'lucide-react';

const TradePage = () => {
  const [showPreview, setShowPreview] = useState(false);
  const [intentData, setIntentData] = useState(null);

  const mockMarketData = {
    pairs: [
      { from: 'SUI', to: 'USDC', rate: '2.45', change: '+2.3%', volume: '$12.5M' },
      { from: 'SUI', to: 'ETH', rate: '0.000756', change: '-1.2%', volume: '$8.3M' },
      { from: 'ETH', to: 'USDC', rate: '3240', change: '+0.8%', volume: '$45.2M' },
    ],
    orderbook: {
      bids: [
        { price: '2.448', amount: '1,250', total: '3,060' },
        { price: '2.445', amount: '2,100', total: '5,134' },
        { price: '2.442', amount: '890', total: '2,173' },
      ],
      asks: [
        { price: '2.452', amount: '1,850', total: '4,536' },
        { price: '2.455', amount: '950', total: '2,332' },
        { price: '2.458', amount: '1,200', total: '2,950' },
      ]
    }
  };

  const handleCreateIntent = (data: any) => {
    setIntentData(data);
    setShowPreview(true);
  };

  const handleSubmitIntent = () => {
    // Mock submission - would integrate with backend
    const orderId = Math.random().toString(36).substr(2, 9);
    alert(`Intent order created! Order ID: ${orderId}`);
    setShowPreview(false);
    // Redirect to orders page
    window.location.href = '/orders';
  };

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
            Intent-Based Trading
          </h1>
          <p className="text-slate-400 text-lg">
            Create smart cross-chain swaps executed by our AI resolver network
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Trading Interface */}
          <div className="lg:col-span-2">
            {/* Intent Builder */}
            <IntentBuilderSection 
              showHeader={false} 
              showRates={true}
              onCreateIntent={handleCreateIntent}
              className="mb-8"
            />

            {/* Market Overview */}
            <motion.div
              className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className="text-xl font-bold text-white mb-4">Market Overview</h3>
              <div className="space-y-3">
                {mockMarketData.pairs.map((pair, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-white font-medium">
                        {pair.from}/{pair.to}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-medium">{pair.rate}</div>
                      <div className={`text-sm ${pair.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                        {pair.change}
                      </div>
                    </div>
                    <div className="text-slate-400 text-sm">
                      Vol: {pair.volume}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Book */}
            <motion.div
              className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h3 className="text-lg font-bold text-white mb-4">Order Book (SUI/USDC)</h3>
              
              {/* Asks */}
              <div className="mb-4">
                <div className="text-red-400 text-sm font-medium mb-2">Asks</div>
                {mockMarketData.orderbook.asks.map((ask, index) => (
                  <div key={index} className="flex justify-between text-sm py-1">
                    <span className="text-red-400">{ask.price}</span>
                    <span className="text-slate-300">{ask.amount}</span>
                    <span className="text-slate-400">{ask.total}</span>
                  </div>
                ))}
              </div>

              {/* Current Price */}
              <div className="border-t border-b border-slate-600 py-2 my-4 text-center">
                <div className="text-white font-bold text-lg">$2.450</div>
                <div className="text-green-400 text-sm">+0.05 (+2.08%)</div>
              </div>

              {/* Bids */}
              <div>
                <div className="text-green-400 text-sm font-medium mb-2">Bids</div>
                {mockMarketData.orderbook.bids.map((bid, index) => (
                  <div key={index} className="flex justify-between text-sm py-1">
                    <span className="text-green-400">{bid.price}</span>
                    <span className="text-slate-300">{bid.amount}</span>
                    <span className="text-slate-400">{bid.total}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Active Resolvers */}
            <motion.div
              className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h3 className="text-lg font-bold text-white mb-4">Active Resolvers</h3>
              <div className="space-y-3">
                {[
                  { name: 'Resolver Alpha', status: 'active', success: '99.2%', inventory: 'High' },
                  { name: 'Resolver Beta', status: 'active', success: '98.8%', inventory: 'Medium' },
                  { name: 'Resolver Gamma', status: 'analyzing', success: '99.5%', inventory: 'High' },
                ].map((resolver, index) => (
                  <div key={index} className="p-3 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">{resolver.name}</span>
                      <div className={`w-2 h-2 rounded-full ${
                        resolver.status === 'active' ? 'bg-green-400' : 'bg-yellow-400'
                      }`} />
                    </div>
                    <div className="text-sm text-slate-400">
                      Success: {resolver.success} • Inventory: {resolver.inventory}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && intentData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            className="bg-slate-800 rounded-2xl border border-slate-600 p-6 max-w-md w-full shadow-2xl"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
          >
            <h3 className="text-xl font-bold text-white mb-4">Preview Intent Order</h3>
            
            <div className="space-y-4 mb-6">
              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="text-slate-400 text-sm mb-2">You're Trading</div>
                <div className="text-white font-medium">
                  {(intentData as any).amount} {(intentData as any).sourceToken} on {(intentData as any).sourceChain}
                </div>
              </div>
              
              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="text-slate-400 text-sm mb-2">You'll Receive</div>
                <div className="text-white font-medium">
                  ≈ {(intentData as any).estimatedOutput} {(intentData as any).targetToken} on {(intentData as any).targetChain}
                </div>
              </div>

              {(intentData as any).condition && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-yellow-400 text-sm mb-1">
                    <AlertCircle size={16} />
                    Condition
                  </div>
                  <div className="text-white">{(intentData as any).condition}</div>
                </div>
              )}

              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="text-slate-400 text-sm mb-2">Execution Details</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Network Fee:</span>
                    <span className="text-white">$0.12</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Est. Time:</span>
                    <span className="text-white">~30 seconds</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Max Slippage:</span>
                    <span className="text-white">0.1%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPreview(false)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSubmitIntent}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg transition-colors"
              >
                Submit Intent
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TradePage;