"use client"

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeftRight, Settings, Info } from 'lucide-react';

interface ChainSelectorProps {
  mode: 'same-chain' | 'cross-chain';
  onModeChange: (mode: 'same-chain' | 'cross-chain') => void;
}

const ChainSelector: React.FC<ChainSelectorProps> = ({ mode, onModeChange }) => {
  return (
    <div className="flex bg-slate-800/50 rounded-xl p-1 mb-6">
      <button
        onClick={() => onModeChange('same-chain')}
        className={`flex-1 py-3 px-6 rounded-lg transition-all duration-200 ${
          mode === 'same-chain'
            ? 'bg-blue-500 text-white shadow-lg'
            : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
        }`}
      >
        <div className="font-medium">Same Chain</div>
        <div className="text-xs opacity-80">7 chains supported</div>
      </button>
      <button
        onClick={() => onModeChange('cross-chain')}
        className={`flex-1 py-3 px-6 rounded-lg transition-all duration-200 ${
          mode === 'cross-chain'
            ? 'bg-purple-500 text-white shadow-lg'
            : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
        }`}
      >
        <div className="font-medium">Cross Chain</div>
        <div className="text-xs opacity-80">ETH ↔ SUI only</div>
      </button>
    </div>
  );
};

export default ChainSelector;
