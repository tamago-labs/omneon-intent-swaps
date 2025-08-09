"use client"

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ArrowUpDown, Settings, Info } from 'lucide-react';

// Chain configurations
export const SAME_CHAIN_NETWORKS = [
  { 
    id: 'ethereum', 
    name: 'Ethereum', 
    symbol: 'ETH', 
    logo: '⟠', 
    color: 'text-blue-400',
    chainId: 1
  },
  { 
    id: 'base', 
    name: 'Base', 
    symbol: 'ETH', 
    logo: '🔵', 
    color: 'text-blue-300',
    chainId: 8453
  },
  { 
    id: 'polygon', 
    name: 'Polygon', 
    symbol: 'MATIC', 
    logo: '🟣', 
    color: 'text-purple-400',
    chainId: 137
  },
  { 
    id: 'bnb', 
    name: 'BNB Chain', 
    symbol: 'BNB', 
    logo: '🟡', 
    color: 'text-yellow-400',
    chainId: 56
  },
  { 
    id: 'sui', 
    name: 'SUI', 
    symbol: 'SUI', 
    logo: '🔷', 
    color: 'text-cyan-400',
    chainId: null
  },
  { 
    id: 'cronos', 
    name: 'Cronos', 
    symbol: 'CRO', 
    logo: '⚫', 
    color: 'text-slate-300',
    chainId: 25
  },
  { 
    id: 'optimism', 
    name: 'Optimism', 
    symbol: 'ETH', 
    logo: '🔴', 
    color: 'text-red-400',
    chainId: 10
  }
];

export const CROSS_CHAIN_NETWORKS = [
  { 
    id: 'ethereum', 
    name: 'Ethereum', 
    symbol: 'ETH', 
    logo: '⟠', 
    color: 'text-blue-400',
    chainId: 1
  },
  { 
    id: 'sui', 
    name: 'SUI', 
    symbol: 'SUI', 
    logo: '🔷', 
    color: 'text-cyan-400',
    chainId: null
  }
];

// Mock token data
export const TOKEN_DATA = {
  ethereum: [
    { symbol: 'ETH', name: 'Ethereum', logo: '⟠', price: 3240, balance: 0.75, decimals: 18 },
    { symbol: 'USDC', name: 'USD Coin', logo: '💚', price: 1.00, balance: 1250, decimals: 6 },
    { symbol: 'USDT', name: 'Tether', logo: '💛', price: 1.00, balance: 500, decimals: 6 },
    { symbol: 'WBTC', name: 'Wrapped Bitcoin', logo: '🟠', price: 67450, balance: 0.01, decimals: 8 },
    { symbol: 'DAI', name: 'Dai Stablecoin', logo: '🟢', price: 1.00, balance: 800, decimals: 18 }
  ],
  base: [
    { symbol: 'ETH', name: 'Ethereum', logo: '⟠', price: 3240, balance: 0.5, decimals: 18 },
    { symbol: 'USDC', name: 'USD Coin', logo: '💚', price: 1.00, balance: 2000, decimals: 6 },
    { symbol: 'CBETH', name: 'Coinbase ETH', logo: '🔵', price: 3200, balance: 0.3, decimals: 18 }
  ],
  polygon: [
    { symbol: 'MATIC', name: 'Polygon', logo: '🟣', price: 0.85, balance: 500, decimals: 18 },
    { symbol: 'USDC', name: 'USD Coin', logo: '💚', price: 1.00, balance: 750, decimals: 6 },
    { symbol: 'WETH', name: 'Wrapped ETH', logo: '⟠', price: 3240, balance: 0.2, decimals: 18 }
  ],
  bnb: [
    { symbol: 'BNB', name: 'BNB', logo: '🟡', price: 590, balance: 2.5, decimals: 18 },
    { symbol: 'USDT', name: 'Tether', logo: '💛', price: 1.00, balance: 1000, decimals: 18 },
    { symbol: 'BUSD', name: 'Binance USD', logo: '🟨', price: 1.00, balance: 300, decimals: 18 }
  ],
  sui: [
    { symbol: 'SUI', name: 'SUI', logo: '🔷', price: 2.45, balance: 250, decimals: 9 },
    { symbol: 'USDC', name: 'USD Coin', logo: '💚', price: 1.00, balance: 400, decimals: 6 },
    { symbol: 'WETH', name: 'Wrapped ETH', logo: '⟠', price: 3240, balance: 0.1, decimals: 8 }
  ],
  cronos: [
    { symbol: 'CRO', name: 'Cronos', logo: '⚫', price: 0.12, balance: 1000, decimals: 8 },
    { symbol: 'USDC', name: 'USD Coin', logo: '💚', price: 1.00, balance: 150, decimals: 6 }
  ],
  optimism: [
    { symbol: 'ETH', name: 'Ethereum', logo: '⟠', price: 3240, balance: 0.4, decimals: 18 },
    { symbol: 'USDC', name: 'USD Coin', logo: '💚', price: 1.00, balance: 600, decimals: 6 },
    { symbol: 'OP', name: 'Optimism', logo: '🔴', price: 2.8, balance: 100, decimals: 18 }
  ]
};

interface SwapInputProps {
  mode: 'same-chain' | 'cross-chain';
  fromChain: string;
  toChain: string;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  onFromChainChange: (chain: string) => void;
  onToChainChange: (chain: string) => void;
  onFromTokenChange: (token: string) => void;
  onToTokenChange: (token: string) => void;
  onFromAmountChange: (amount: string) => void;
  onFlip: () => void;
}

const SwapInput: React.FC<SwapInputProps> = ({
  mode,
  fromChain,
  toChain,
  fromToken,
  toToken,
  fromAmount,
  toAmount,
  onFromChainChange,
  onToChainChange,
  onFromTokenChange,
  onToTokenChange,
  onFromAmountChange,
  onFlip
}) => {
  const [showFromChainSelect, setShowFromChainSelect] = useState(false);
  const [showToChainSelect, setShowToChainSelect] = useState(false);
  const [showFromTokenSelect, setShowFromTokenSelect] = useState(false);
  const [showToTokenSelect, setShowToTokenSelect] = useState(false);

  const availableChains = mode === 'same-chain' ? SAME_CHAIN_NETWORKS : CROSS_CHAIN_NETWORKS;
  const fromChainData = availableChains.find(c => c.id === fromChain);
  const toChainData = availableChains.find(c => c.id === toChain);
  
  const fromTokens = TOKEN_DATA[fromChain as keyof typeof TOKEN_DATA] || [];
  const toTokens = TOKEN_DATA[toChain as keyof typeof TOKEN_DATA] || [];
  
  const selectedFromToken = fromTokens.find(t => t.symbol === fromToken);
  const selectedToToken = toTokens.find(t => t.symbol === toToken);

  // Calculate estimated output (mock calculation)
  const calculateOutput = () => {
    if (!selectedFromToken || !selectedToToken || !fromAmount) return '0';
    const inputValue = parseFloat(fromAmount) * selectedFromToken.price;
    const outputAmount = inputValue / selectedToToken.price;
    return outputAmount.toFixed(6);
  };

  const estimatedOutput = calculateOutput();

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
      {/* From Section */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-400 text-sm">From</span>
          {selectedFromToken && (
            <span className="text-slate-400 text-sm">
              Balance: {selectedFromToken.balance.toLocaleString()} {selectedFromToken.symbol}
            </span>
          )}
        </div>
        
        <div className="bg-slate-700/30 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            {/* Chain Selector */}
            <div className="relative">
              <button
                onClick={() => setShowFromChainSelect(!showFromChainSelect)}
                className="flex items-center gap-2 bg-slate-600/50 hover:bg-slate-600 rounded-lg px-3 py-2 transition-colors"
              >
                <span className="text-lg">{fromChainData?.logo}</span>
                <span className="text-white font-medium">{fromChainData?.name}</span>
                <ChevronDown size={16} className="text-slate-400" />
              </button>
              
              {showFromChainSelect && (
                <div className="absolute top-full left-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-10 min-w-[200px]">
                  {availableChains.map((chain) => (
                    <button
                      key={chain.id}
                      onClick={() => {
                        onFromChainChange(chain.id);
                        setShowFromChainSelect(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 hover:bg-slate-700 transition-colors first:rounded-t-lg last:rounded-b-lg"
                    >
                      <span className="text-lg">{chain.logo}</span>
                      <span className="text-white">{chain.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Token Selector */}
            <div className="relative">
              <button
                onClick={() => setShowFromTokenSelect(!showFromTokenSelect)}
                className="flex items-center gap-2 bg-slate-600/50 hover:bg-slate-600 rounded-lg px-3 py-2 transition-colors"
              >
                <span className="text-lg">{selectedFromToken?.logo}</span>
                <span className="text-white font-medium">{selectedFromToken?.symbol}</span>
                <ChevronDown size={16} className="text-slate-400" />
              </button>
              
              {showFromTokenSelect && (
                <div className="absolute top-full left-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-10 min-w-[200px]">
                  {fromTokens.map((token) => (
                    <button
                      key={token.symbol}
                      onClick={() => {
                        onFromTokenChange(token.symbol);
                        setShowFromTokenSelect(false);
                      }}
                      className="flex items-center justify-between w-full px-4 py-3 hover:bg-slate-700 transition-colors first:rounded-t-lg last:rounded-b-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{token.logo}</span>
                        <div className="text-left">
                          <div className="text-white font-medium">{token.symbol}</div>
                          <div className="text-slate-400 text-xs">{token.name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-slate-300 text-sm">{token.balance}</div>
                        <div className="text-slate-400 text-xs">${token.price.toLocaleString()}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Amount Input */}
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={fromAmount}
              onChange={(e) => onFromAmountChange(e.target.value)}
              placeholder="0.0"
              className="flex-1 bg-transparent text-2xl font-medium text-white placeholder-slate-500 focus:outline-none"
            />
            <button
              onClick={() => selectedFromToken && onFromAmountChange(selectedFromToken.balance.toString())}
              className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-3 py-1 rounded-md text-sm transition-colors"
            >
              MAX
            </button>
          </div>

          {selectedFromToken && fromAmount && (
            <div className="text-slate-400 text-sm mt-2">
              ≈ ${(parseFloat(fromAmount) * selectedFromToken.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          )}
        </div>
      </div>

      {/* Flip Button */}
      <div className="flex justify-center my-4">
        <button
          onClick={onFlip}
          className="bg-slate-700 hover:bg-slate-600 p-3 rounded-xl transition-colors group"
        >
          <ArrowUpDown size={20} className="text-slate-400 group-hover:text-white transition-colors" />
        </button>
      </div>

      {/* To Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-400 text-sm">To</span>
          {selectedToToken && (
            <span className="text-slate-400 text-sm">
              Balance: {selectedToToken.balance.toLocaleString()} {selectedToToken.symbol}
            </span>
          )}
        </div>
        
        <div className="bg-slate-700/30 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            {/* Chain Selector */}
            <div className="relative">
              <button
                onClick={() => setShowToChainSelect(!showToChainSelect)}
                className="flex items-center gap-2 bg-slate-600/50 hover:bg-slate-600 rounded-lg px-3 py-2 transition-colors"
                disabled={mode === 'same-chain'}
              >
                <span className="text-lg">{toChainData?.logo}</span>
                <span className="text-white font-medium">{toChainData?.name}</span>
                {mode === 'cross-chain' && <ChevronDown size={16} className="text-slate-400" />}
              </button>
              
              {showToChainSelect && mode === 'cross-chain' && (
                <div className="absolute top-full left-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-10 min-w-[200px]">
                  {availableChains.filter(c => c.id !== fromChain).map((chain) => (
                    <button
                      key={chain.id}
                      onClick={() => {
                        onToChainChange(chain.id);
                        setShowToChainSelect(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 hover:bg-slate-700 transition-colors first:rounded-t-lg last:rounded-b-lg"
                    >
                      <span className="text-lg">{chain.logo}</span>
                      <span className="text-white">{chain.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Token Selector */}
            <div className="relative">
              <button
                onClick={() => setShowToTokenSelect(!showToTokenSelect)}
                className="flex items-center gap-2 bg-slate-600/50 hover:bg-slate-600 rounded-lg px-3 py-2 transition-colors"
              >
                <span className="text-lg">{selectedToToken?.logo}</span>
                <span className="text-white font-medium">{selectedToToken?.symbol}</span>
                <ChevronDown size={16} className="text-slate-400" />
              </button>
              
              {showToTokenSelect && (
                <div className="absolute top-full left-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-10 min-w-[200px]">
                  {toTokens.map((token) => (
                    <button
                      key={token.symbol}
                      onClick={() => {
                        onToTokenChange(token.symbol);
                        setShowToTokenSelect(false);
                      }}
                      className="flex items-center justify-between w-full px-4 py-3 hover:bg-slate-700 transition-colors first:rounded-t-lg last:rounded-b-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{token.logo}</span>
                        <div className="text-left">
                          <div className="text-white font-medium">{token.symbol}</div>
                          <div className="text-slate-400 text-xs">{token.name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-slate-300 text-sm">{token.balance}</div>
                        <div className="text-slate-400 text-xs">${token.price.toLocaleString()}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Amount Output */}
          <div className="flex items-center">
            <input
              type="text"
              value={estimatedOutput}
              readOnly
              placeholder="0.0"
              className="flex-1 bg-transparent text-2xl font-medium text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          {selectedToToken && estimatedOutput !== '0' && (
            <div className="text-slate-400 text-sm mt-2">
              ≈ ${(parseFloat(estimatedOutput) * selectedToToken.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          )}
        </div>
      </div>

      {/* Swap Details */}
      {fromAmount && parseFloat(fromAmount) > 0 && (
        <div className="mt-4 bg-slate-700/20 rounded-lg p-3">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-slate-400">Rate</span>
            <span className="text-white">
              1 {selectedFromToken?.symbol} = {selectedToToken && selectedFromToken ? (selectedFromToken.price / selectedToToken.price).toFixed(6) : '0'} {selectedToToken?.symbol}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-slate-400">Network Fee</span>
            <span className="text-white">≈ $2.50</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Route</span>
            <span className="text-white">
              {mode === 'same-chain' ? 'Direct Swap' : 'Cross-Chain Bridge'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SwapInput;
