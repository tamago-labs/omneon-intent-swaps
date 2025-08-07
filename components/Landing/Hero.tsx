"use client"

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Shield, Globe, ChevronUp, ChevronDown } from 'lucide-react';

const HeroSection = () => {

    return (
        <div className="relative w-full  py-20">

            <div className="max-w-7xl mx-auto px-4 md:px-4 relative z-10">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
                    {/* Left column - Hero content */}
                    <div className="w-full lg:w-1/2 space-y-8 ">
                        <motion.div
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Zap size={16} className="text-blue-400" />
                            Powered by OKX DEX API
                        </motion.div>

                        <motion.h1
                            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                        >
                            Omni Intent
                            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                                {" "}Swaps{" "}
                            </span>
                            EVM ↔ MoveVM
                        </motion.h1>

                        <motion.p
                            className="text-slate-400 text-sm md:text-lg max-w-2xl leading-relaxed"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        > 
                          An intent-based cross-chain DEX enabling faster, cheaper swaps  between Ethereum and Move ecosystems powered by AI-driven resolvers and OKX’s aggregated liquidity
                        </motion.p>

                        {/* CTA Buttons */}
                        <motion.div
                            className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 w-full max-w-md"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                        >
                            <button className="group flex-1 px-4 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 text-white font-medium sm:font-semibold text-sm sm:text-base rounded-xl flex items-center justify-center gap-2 sm:gap-3 hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105">
                                Start Trading
                                <ArrowRight size={16} className="sm:w-[18px] sm:h-[18px] group-hover:translate-x-1 transition-transform" />
                            </button>

                            <button className="flex-1 px-4 py-3 sm:px-8 sm:py-4 bg-slate-800/80 backdrop-blur-sm text-white font-medium sm:font-semibold text-sm sm:text-base rounded-xl border border-slate-700/50 hover:bg-slate-700/80 hover:border-slate-600/50 transition-all duration-300">
                                Explore Docs
                            </button>
                        </motion.div>


                    </div>

                    {/* Right column - Interactive visualization */}
                    <div className="w-full lg:w-1/2 flex justify-center">
                        <div className="relative w-full max-w-lg aspect-square">

                            {/* 8 Animated dashed lines radiating from center */}
                            {Array.from({ length: 8 }, (_, i) => {
                                const angle = (i * 45) * (Math.PI / 180); // 45 degrees apart
                                const startRadius = 20; // start from edge of logo
                                const endRadius = 48; // extend to edge of container
                                const x1 = 50 + (Math.cos(angle) * startRadius);
                                const y1 = 50 + (Math.sin(angle) * startRadius);
                                const x2 = 50 + (Math.cos(angle) * endRadius);
                                const y2 = 50 + (Math.sin(angle) * endRadius);

                                return (
                                    <svg key={`line-${i}`} className="absolute top-0 left-0 w-full h-full z-10">
                                        <motion.line
                                            x1={`${x1}%`}
                                            y1={`${y1}%`}
                                            x2={`${x2}%`}
                                            y2={`${y2}%`}
                                            stroke="url(#dashGradient)"
                                            strokeWidth="3"
                                            strokeDasharray="8,8"
                                            strokeLinecap="round"
                                            initial={{ opacity: 0 }}
                                            animate={{
                                                opacity: [0, 0.8, 0.8, 0.3, 0.8],
                                                strokeDashoffset: [0, -16, -32, -48, -64]
                                            }}
                                            transition={{
                                                duration: 3,
                                                times: [0, 0.2, 0.7, 0.85, 1],
                                                repeat: Infinity,
                                                delay: 0.8 + (i * 0.2),
                                                repeatDelay: 1
                                            }}
                                        />
                                        <defs>
                                            <linearGradient id="dashGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.9" />
                                                <stop offset="50%" stopColor="#8b5cf6" stopOpacity="1" />
                                                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.9" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                );
                            })}

                            {/* Subtle pulsing background glow */}
                            <motion.div
                                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 rounded-full blur-3xl"
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.3, 0.6, 0.3]
                                }}
                                transition={{
                                    duration: 5,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroSection;