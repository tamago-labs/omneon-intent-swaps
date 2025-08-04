"use client"

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, FileText, Users } from 'lucide-react';

const HowItWorksSection = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: 0,
      title: "Define Intent",
      description: "Specify your cross-chain swap requirements with custom conditions and triggers",
      icon: <Target size={20} />,
      details: [
        "Set source and destination chains",
        "Define token amounts and target rates",
        "Add conditions like 'when rate hits $2.50'"
      ],
      example: "Swap 100 SUI for USDC on Ethereum when rate hits $2.50"
    },
    {
      id: 1,
      title: "Create Order",
      description: "Your intent is broadcast to the resolver network with timelock protection",
      icon: <FileText size={20} />,
      details: [
        "Intent signed and timestamped",
        "Funds locked in escrow contract", 
        "Order visible to all resolvers"
      ],
      example: "Order #1234 created with 24h execution window"
    },
    {
      id: 2,
      title: "Resolver Execution",
      description: "Qualified resolvers compete to fulfill your intent atomically across chains",
      icon: <Users size={20} />,
      details: [
        "Resolvers check inventory & rates",
        "Best resolver executes simultaneously",
        "Atomic settlement or full refund"
      ],
      example: "Resolver executes: SUI locked → USDC delivered"
    }
  ];

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
            How It Works
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          AI-powered resolvers match and execute user intents across chains
          </p>
        </motion.div>

        {/* Side Tab Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left Side - Tabs */}
          <div className="lg:col-span-2 space-y-3">
            {steps.map((step, index) => (
              <motion.button
                key={step.id}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-300 ${
                  activeStep === index
                    ? 'bg-blue-500/10 border-blue-500/30 text-white'
                    : 'bg-slate-800/30 border-slate-700/30 text-slate-400 hover:bg-slate-700/30 hover:border-slate-600/30'
                }`}
                onClick={() => setActiveStep(index)}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ x: 4 }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    activeStep === index
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-700 text-slate-400'
                  }`}>
                    {step.icon}
                  </div>
                  <div>
                    <div className="font-medium text-sm">
                      Step {index + 1}
                    </div>
                    <div className={`font-semibold ${
                      activeStep === index ? 'text-white' : 'text-slate-300'
                    }`}>
                      {step.title}
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Right Side - Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeStep}
              className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-8 h-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Step Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white">
                  {steps[activeStep].icon}
                </div>
                <div>
                  <div className="text-blue-400 text-sm font-medium">
                    Step {activeStep + 1}
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    {steps[activeStep].title}
                  </h3>
                </div>
              </div>

              {/* Description */}
              <p className="text-slate-300 text-lg mb-6 leading-relaxed">
                {steps[activeStep].description}
              </p>



              {/* Details */}
              <div className="space-y-3">
                <div className="text-slate-400 text-sm font-medium mb-4">
                  What happens:
                </div>
                {steps[activeStep].details.map((detail, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center gap-3 text-slate-300"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                    <span className="text-sm">{detail}</span>
                  </motion.div>
                ))}
              </div>

              {/* Progress Indicator */}
              <div className="mt-8 pt-6 border-t border-slate-700/50">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Progress</span>
                  <span className="text-blue-400 font-medium">
                    {activeStep + 1} of {steps.length}
                  </span>
                </div>
                <div className="mt-2 h-1 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div> 
      </div>
    </div>
  );
};

export default HowItWorksSection;