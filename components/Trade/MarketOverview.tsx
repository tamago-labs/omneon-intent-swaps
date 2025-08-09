"use client"

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, DollarSign } from 'lucide-react';

interface MarketOverviewProps {
  mode: 'same-chain' | 'cross-chain';
  selectedChain: string;
}

// Mock market data
const MARKET_DATA = {
  'same-chain': {
    ethereum: [
      { pair: 'ETH/USDC', price: '3,240.00', change: '+2.5%', volume: '$245M', isUp: true },
      { pair: 'WBTC/ETH', price: '20.82', change: '-0.8%', volume: '$89M', isUp: false },
      { pair: 'USDC/USDT', price: '1.0001', change: '+0.01%', volume: '$156M', isUp: true },
    ],
    base: [
      { pair: 'ETH/USDC', price: '3,238.50', change: '+2.3%', volume: '$45M', isUp: true },
      { pair: 'CBETH/ETH', price: '0.987', change: '-0.2%', volume: '$12M', isUp: false },
    ],
    polygon: [
      { pair: 'MATIC/USDC', price: '0.85', change: '+5.2%', volume: '$28M', isUp: true },
      { pair: 'WETH/USDC', price: '3,235.00', change: '+2.1%', volume: '$34M', isUp: true },
    ],
    bnb: [
      { pair: 'BNB/USDT', price: '590.00', change: '+1.8%', volume: '$67M', isUp: true },
      { pair: 'BUSD/USDT', price: '1.0000', change: '0.00%', volume: '$23M', isUp: true },
    ],
    sui: [
      { pair: 'SUI/USDC', price: '2.45', change: '+8.3%', volume: '$15M', isUp: true },
      { pair: 'WETH/SUI', price: '1,322.45', change: '-5.8%', volume: '$8M', isUp: false },
    ],
    cronos: [
      { pair: 'CRO/USDC', price: '0.12', change: '+3.4%', volume: '$5M', isUp: true },
    ],
    optimism: [
      { pair: 'ETH/USDC', price: '3,241.00', change: '+2.6%', volume: '$18M', isUp: true },
      { pair: 'OP/ETH', price: '0.00086', change: '+12.5%', volume: '$9M', isUp: true },
    ]
  },
  'cross-chain': [
    { pair: 'ETH/SUI', price: '1,322.45', change: '-5.8%', volume: '$12M', isUp: false },
    { pair: 'SUI/ETH', price: '0.000756', change: '+6.2%', volume: '$12M', isUp: true },
    { pair: 'USDC(ETH)/USDC(SUI)', price: '1.0015', change: '+0.15%', volume: '$8M', isUp: true },
  ]
};

const MarketOverview: React.FC<MarketOverviewProps> = ({ mode, selectedChain }) => {
  const data = mode === 'same-chain' 
    ? MARKET_DATA['same-chain'][selectedChain as keyof typeof MARKET_DATA['same-chain']] || []
    : MARKET_DATA['cross-chain'];

  const title = mode === 'same-chain' 
    ? `${selectedChain.charAt(0).toUpperCase() + selectedChain.slice(1)} Markets`
    : 'Cross-Chain Markets';

  // Calculate total volume
  const totalVolume = data.reduce((sum, market) => {
    const volume = parseFloat(market.volume.replace(/[$M]/g, ''));
    return sum + volume;
  }, 0);

  return (
    <motion.div
      className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <Activity size={16} />
          Live Data
        </div>
      </div>

      {data.length > 0 ? (
        <>
          <div className="space-y-3 mb-4">
            {data.map((market, index) => (
              <motion.div
                key={market.pair}
                className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center gap-3">
                  <div className="text-white font-medium">{market.pair}</div>
                  <div className={`flex items-center gap-1 text-sm ${
                    market.isUp ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {market.isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {market.change}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-white font-medium">${market.price}</div>
                  <div className="text-slate-400 text-sm flex items-center gap-1">
                    <DollarSign size={12} />
                    {market.volume}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Market Stats Summary */}
          <div className="border-t border-slate-700 pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Total 24h Volume</span>
              <span className="text-white font-medium">${totalVolume.toFixed(0)}M</span>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-8 text-slate-400">
          <Activity size={32} className="mx-auto mb-2 opacity-50" />
          <p>No market data available for this chain</p>
        </div>
      )}
    </motion.div>
  );
};

export default MarketOverview;
