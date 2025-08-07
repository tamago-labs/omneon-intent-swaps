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
    // { 
    //   name: 'Base', 
    //   symbol: 'BASE', 
    //   color: 'bg-blue-600',
    //   icon: 'data:image/png;base64,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'
    // },
    // { 
    //   name: 'Optimism', 
    //   symbol: 'OP', 
    //   color: 'bg-red-500',
    //   icon: 'https://optimistic.etherscan.io/assets/optimism/images/svg/logos/token-secondary-light.svg?v=25.7.5.2'
    // },
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
      <div className="max-w-3xl mx-auto px-4 md:px-10">
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

            <div className="grid grid-cols-1 sm:grid-cols-1 gap-3">
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

            <div className="grid grid-cols-1 sm:grid-cols-1 gap-3">
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
              <strong className="text-white">Same-chain swaps:</strong> Powered by OKX DEX API for optimal routing and execution
            </p>
            <p>
              <strong className="text-white">Cross-chain swaps:</strong> Currently available for EVM to EVM chains only
            </p> 
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SupportedChainsSection;