"use client"

import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, Zap, Shield, Clock, DollarSign, Globe, Users } from 'lucide-react';

const ComparisonTableSection = () => {
  const features = [
    {
      feature: "Cross-Chain Execution",
      description: "Native support for EVM ↔ Move VM swaps",
      omneon: true,
      bridges: "Limited",
      dexs: false,
      icon: <Globe size={16} />
    },
    {
      feature: "Intent-Based Trading",
      description: "Set conditions and let resolvers execute",
      omneon: true,
      bridges: false,
      dexs: false,
      icon: <Zap size={16} />
    },
    {
      feature: "Atomic Settlement",
      description: "All-or-nothing execution guarantee",
      omneon: true,
      bridges: false,
      dexs: "Single chain only",
      icon: <Shield size={16} />
    },
    {
      feature: "Execution Time",
      description: "Average settlement speed",
      omneon: "~30 seconds",
      bridges: "5-20 minutes",
      dexs: "Instant*",
      icon: <Clock size={16} />
    },
    // {
    //   feature: "Bridge Fees",
    //   description: "Additional fees for cross-chain",
    //   omneon: "$0",
    //   bridges: "$5-50",
    //   dexs: "N/A",
    //   icon: <DollarSign size={16} />
    // },
    // {
    //   feature: "Failed Transaction Risk",
    //   description: "Risk of partial execution or stuck funds",
    //   omneon: "Zero risk",
    //   bridges: "High risk",
    //   dexs: "Low risk*",
    //   icon: <Shield size={16} />
    // },
    // {
    //   feature: "Slippage Protection",
    //   description: "Protection against price movements",
    //   omneon: true,
    //   bridges: false,
    //   dexs: "Partial",
    //   icon: <Shield size={16} />
    // },
    // {
    //   feature: "Account Abstraction",
    //   description: "Gasless transactions and improved UX",
    //   omneon: true,
    //   bridges: false,
    //   dexs: "Limited",
    //   icon: <Users size={16} />
    // },
  ];

  const renderValue = (value: any) => {
    if (value === true) {
      return <Check size={16} className="text-green-400 mx-auto" />;
    }
    if (value === false) {
      return <X size={16} className="text-red-400 mx-auto" />;
    }
    if (typeof value === 'string') {
      return <span className="text-sm text-center">{value}</span>;
    }
    return value;
  };

  return (
    <div className="w-full py-20">
      <div className="max-w-6xl mx-auto px-4 md:px-10">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Why Choose Omneon?
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Compare our intent-based cross-chain solution with traditional bridges and DEXs
          </p>
        </motion.div>

        {/* Comparison Table */}
        <motion.div
          className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          {/* Table Header */}
          <div className="grid grid-cols-4 bg-slate-900/50 border-b border-slate-700/50">
            <div className="p-6">
              <div className="text-slate-400 text-sm font-medium">FEATURES</div>
            </div>
            <div className="p-6 text-center border-l border-slate-700/50">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text font-bold text-lg">
                Omneon
              </div>
              <div className="text-slate-400 text-xs mt-1">Intent-Based</div>
            </div>
            <div className="p-6 text-center border-l border-slate-700/50">
              <div className="text-white font-medium">Traditional Bridges</div>
              <div className="text-slate-400 text-xs mt-1">Cross-Chain</div>
            </div>
            <div className="p-6 text-center border-l border-slate-700/50">
              <div className="text-white font-medium">DEXs</div>
              <div className="text-slate-400 text-xs mt-1">Single Chain</div>
            </div>
          </div>

          {/* Table Rows */}
          {features.map((item, index) => (
            <motion.div
              key={index}
              className="grid grid-cols-4 border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              viewport={{ once: true }}
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-blue-400">{item.icon}</div>
                  <div className="text-white font-medium">{item.feature}</div>
                </div>
                <div className="text-slate-400 text-sm">{item.description}</div>
              </div>
              
              <div className="p-6 text-center border-l border-slate-700/50 flex items-center justify-center">
                <div className="text-white">{renderValue(item.omneon)}</div>
              </div>
              
              <div className="p-6 text-center border-l border-slate-700/50 flex items-center justify-center">
                <div className="text-slate-300">{renderValue(item.bridges)}</div>
              </div>
              
              <div className="p-6 text-center border-l border-slate-700/50 flex items-center justify-center">
                <div className="text-slate-300">{renderValue(item.dexs)}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Stats */}
        <motion.div
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/30 p-6 text-center">
            <div className="text-3xl font-bold text-white mb-2">99.9%</div>
            <div className="text-slate-400 text-sm">Success Rate</div>
            <div className="text-green-400 text-xs mt-1">Guaranteed execution</div>
          </div>
          
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/30 p-6 text-center">
            <div className="text-3xl font-bold text-white mb-2">$0</div>
            <div className="text-slate-400 text-sm">Bridge Fees</div>
            <div className="text-blue-400 text-xs mt-1">No additional costs</div>
          </div>
          
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/30 p-6 text-center">
            <div className="text-3xl font-bold text-white mb-2">5+</div>
            <div className="text-slate-400 text-sm">Active Resolvers</div>
            <div className="text-purple-400 text-xs mt-1">Competitive rates</div>
          </div>
        </motion.div>

        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl border border-blue-500/20 p-8">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to Experience the Future of Cross-Chain Trading?
            </h3>
            <p className="text-slate-400 mb-6 max-w-2xl mx-auto">
              Join thousands of traders who have already switched to intent-based swaps for safer, faster, and more cost-effective cross-chain trading.
            </p>
            <motion.a
              href="/trade"
              className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Trading Now
            </motion.a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ComparisonTableSection;