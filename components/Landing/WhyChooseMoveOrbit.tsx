"use client"

import React from 'react';
import { motion } from 'framer-motion';
import { Check, TrendingUp, Code, Users } from 'lucide-react';

const WhyChooseMoveOrbit = () => {
  const advantages = [
    {
      icon: <Code size={24} />,
      title: "Built on 1inch Fusion+",
      description: "Leverages battle-tested infrastructure with over $200B+ in cumulative volume and proven security track record",
      stats: "$200B+ Volume"
    },
    {
      icon: <TrendingUp size={24} />,
      title: "First Native EVM ↔ Move Bridge",
      description: "Purpose-built solution specifically designed for bridging between Ethereum Virtual Machine and Move-based ecosystems",
      stats: "9+ Networks"
    },
    {
      icon: <Users size={24} />,
      title: "Decentralized Resolver Network",
      description: "Distributed network of resolvers ensures optimal execution, competitive rates, and high availability across all supported chains",
      stats: "99.9% Uptime"
    },
    {
      icon: <Check size={24} />,
      title: "Advanced Order Types",
      description: "Support for limit orders, DCA strategies, partial fills, and sophisticated cross-chain trading mechanisms",
      stats: "Multiple Options"
    }
  ];

  return (
    <div className="w-full py-20" >
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
            Comparison Table
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            The most advanced and secure solution for cross-chain operations between EVM and Move ecosystems
          </p>
        </motion.div>


        {/* Comparison Table */}
        <motion.div
          className="mt-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        > 

          <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/40 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/40">
                    <th className="text-left p-6 text-slate-300 font-medium">Feature</th>
                    <th className="text-center p-6 text-white font-semibold">MoveOrbit</th>
                    <th className="text-center p-6 text-slate-400 font-medium">Traditional Bridges</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-700/20">
                    <td className="p-6 text-slate-300">EVM ↔ Move Support</td>
                    <td className="p-6 text-center">
                      <Check size={20} className="text-green-400 mx-auto" />
                    </td>
                    <td className="p-6 text-center text-slate-500">Limited</td>
                  </tr>
                  <tr className="border-b border-slate-700/20">
                    <td className="p-6 text-slate-300">Atomic Settlements</td>
                    <td className="p-6 text-center">
                      <Check size={20} className="text-green-400 mx-auto" />
                    </td>
                    <td className="p-6 text-center text-slate-500">Varies</td>
                  </tr>
                  <tr className="border-b border-slate-700/20">
                    <td className="p-6 text-slate-300">Order Management</td>
                    <td className="p-6 text-center">
                      <Check size={20} className="text-green-400 mx-auto" />
                    </td>
                    <td className="p-6 text-center text-slate-500">Basic</td>
                  </tr>
                  <tr className="border-b border-slate-700/20">
                    <td className="p-6 text-slate-300">Partial Fills</td>
                    <td className="p-6 text-center">
                      <Check size={20} className="text-green-400 mx-auto" />
                    </td>
                    <td className="p-6 text-center text-slate-500">No</td>
                  </tr>
                  <tr>
                    <td className="p-6 text-slate-300">Settlement Time</td>
                    <td className="p-6 text-center text-white font-medium">~30 seconds</td>
                    <td className="p-6 text-center text-slate-500">5-20 minutes</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default WhyChooseMoveOrbit;