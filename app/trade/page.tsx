"use client"

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, Shield, Zap, AlertCircle, Info, Activity } from 'lucide-react';
import TradeIntentBuilder from '@/components/Trade/TradeIntentBuilder';

const TradePage = () => {
  
  const [showPreview, setShowPreview] = useState(false);
  const [intentData, setIntentData] = useState(null);

  // Mock market data that changes based on mode
  const getMockMarketData = (mode: string) => {
    if (mode === 'cross-chain') {
      return {
        pairs: [
          { from: 'ETH', to: 'SUI', rate: '0.000756', change: '+6.2%', volume: '$12.5M' },
          { from: 'SUI', to: 'ETH', rate: '1,322.45', change: '-5.8%', volume: '$12.5M' },
          { from: 'USDC(ETH)', to: 'USDC(SUI)', rate: '1.0015', change: '+0.15%', volume: '$8.3M' },
        ],
        title: 'Cross-Chain Markets',
        description: 'ETH ↔ SUI bridge rates and activity'
      };
    }
    
    return {
      pairs: [
        { from: 'SUI', to: 'USDC', rate: '2.45', change: '+2.3%', volume: '$15.2M' },
        { from: 'ETH', to: 'USDC', rate: '3,240', change: '+0.8%', volume: '$245.2M' },
        { from: 'MATIC', to: 'USDC', rate: '0.85', change: '+5.2%', volume: '$28.5M' },
        { from: 'BNB', to: 'USDT', rate: '590', change: '+1.8%', volume: '$67.3M' },
      ],
      title: 'Same-Chain Markets',
      description: 'Popular trading pairs across supported chains'
    };
  };

  const [currentMode, setCurrentMode] = useState<'same-chain' | 'cross-chain'>('same-chain');
  const marketData = getMockMarketData(currentMode);

  const handleCreateIntent = (data: any) => {
    setIntentData(data);
    setCurrentMode(data.mode);
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
    <div className="min-h-screen ">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Trading Interface */}
          <div className="lg:col-span-3">
            {/* Intent Builder */}
            <TradeIntentBuilder 
              showHeader={false} 
              onCreateIntent={handleCreateIntent}
              className="mb-8"
            /> 
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
                  ≈ {(intentData as any).estimatedOutput} {(intentData as any).targetToken}
                  {(intentData as any).mode === 'cross-chain' && ` on ${(intentData as any).targetChain}`}
                </div>
              </div>

              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="text-slate-400 text-sm mb-2">Execution Type</div>
                <div className="text-white font-medium">
                  {(intentData as any).mode === 'cross-chain' ? 'Cross-Chain Bridge' : 'Same-Chain Swap'}
                </div>
              </div>

              {(intentData as any).condition && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-yellow-400 text-sm mb-1">
                    <AlertCircle size={16} />
                    Execution Condition
                  </div>
                  <div className="text-white">{(intentData as any).condition}</div>
                </div>
              )}

              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="text-slate-400 text-sm mb-2">Transaction Details</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Resolver Fee:</span>
                    <span className="text-white">0.3%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Network Fee:</span>
                    <span className="text-white">
                      ${(intentData as any).mode === 'cross-chain' ? '12.50' : '2.50'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Est. Time:</span>
                    <span className="text-white">
                      {(intentData as any).mode === 'cross-chain' ? '2-5 minutes' : '~30 seconds'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Max Slippage:</span>
                    <span className="text-white">{(intentData as any).slippage}%</span>
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
