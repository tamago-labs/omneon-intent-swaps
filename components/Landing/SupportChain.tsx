"use client"

import React from 'react';
import { motion } from 'framer-motion';

const SupportedChainsSection = () => {

  const evmChains = [
    { 
      name: 'Ethereum', 
      symbol: 'ETH', 
      color: 'bg-blue-500',
      icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png'
    },
    // { 
    //   name: 'Polygon', 
    //   symbol: 'MATIC', 
    //   color: 'bg-purple-500',
    //   icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3890.png'
    // },
    { 
      name: 'Base', 
      symbol: 'BASE', 
      color: 'bg-blue-600',
      icon: 'https://images.blockscan.com/chain-logos/base.svg'
    },
    { 
      name: 'Optimism', 
      symbol: 'OP', 
      color: 'bg-red-500',
      icon: 'https://optimistic.etherscan.io/assets/optimism/images/svg/logos/token-secondary-light.svg?v=25.7.5.2'
    },
    // { 
    //   name: 'BNB Chain', 
    //   symbol: 'BNB', 
    //   color: 'bg-yellow-500',
    //   icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png'
    // },
    // { 
    //   name: 'Cronos', 
    //   symbol: 'CRO', 
    //   color: 'bg-blue-700',
    //   icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3635.png'
    // },
  ];

  const moveChains = [
    { 
      name: 'Sui', 
      symbol: 'SUI', 
      color: 'bg-cyan-500',
      icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/20947.png'
    },
  ];

  return (
    <div className="w-full py-16" >
      <div className="max-w-6xl mx-auto px-4 md:px-10">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
            Supported Networks
          </h2>
          <p className="text-slate-400 text-sm md:text-lg max-w-3xl mx-auto">
            Swap assets seamlessly within or between EVM and Move-based ecosystems with AI-powered intent resolution
          </p>
        </motion.div>

        {/* Chains Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* EVM Chains */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-6">
              <motion.div
                className="w-3 h-3 bg-blue-500 rounded-full"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              ></motion.div>
              <h3 className="text-xl font-semibold text-white">EVM Chains</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {evmChains.map((chain, index) => (
                <motion.div
                  key={chain.symbol}
                  className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700/50 p-4 hover:bg-slate-700/50 hover:border-slate-600/50 transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + (index * 0.1) }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 border border-slate-600/50">
                      <img 
                        src={chain.icon} 
                        alt={chain.name}
                        className="w-6 h-6 rounded-full"
                      />
                      <div 
                        className={`w-6 h-6 ${chain.color} rounded-full items-center justify-center text-white text-xs font-bold hidden`}
                        style={{display: 'none'}}
                      >
                        {chain.symbol.slice(0, 2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-white font-medium text-sm">{chain.name}</div>
                      <div className="text-slate-400 text-xs">{chain.symbol}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Move Chains */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-6">
              <motion.div
                className="w-3 h-3 bg-cyan-500 rounded-full"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              ></motion.div>
              <h3 className="text-xl font-semibold text-white">Move Chains</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {moveChains.map((chain, index) => (
                <motion.div
                  key={chain.symbol}
                  className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700/50 p-4 hover:bg-slate-700/50 hover:border-slate-600/50 transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 + (index * 0.1) }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 border border-slate-600/50">
                      <img 
                        src={chain.icon} 
                        alt={chain.name}
                        className="w-6 h-6 rounded-full"
                      />
                      <div 
                        className={`w-6 h-6 ${chain.color} rounded-full items-center justify-center text-white text-xs font-bold hidden`}
                        style={{display: 'none'}}
                      >
                        {chain.symbol.slice(0, 2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-white font-medium text-sm">{chain.name}</div>
                      <div className="text-slate-400 text-xs">{chain.symbol}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

         {/* Bottom Notice */}
         <motion.div
          className="text-center mt-12 pt-8 border-t border-slate-800/50"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="max-w-2xl mx-auto space-y-3 text-slate-300 text-sm">
            <p>
              <strong className="text-white">Same-chain swaps:</strong> Supports all of the above chains using the OKX DEX API
            </p>
            <p>
              <strong className="text-white">Cross-chain swaps:</strong> Available only between Ethereum and SUI
            </p> 
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SupportedChainsSection;