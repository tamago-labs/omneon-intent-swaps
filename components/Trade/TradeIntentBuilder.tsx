"use client"

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Zap, Clock, ArrowRight, Shield, Settings, Info } from 'lucide-react';
import { orderAPI } from '@/lib/api';

interface TradeIntentBuilderProps {
  showHeader?: boolean;
  className?: string;
  onCreateIntent?: (intentData: any) => void;
}

const TradeIntentBuilder: React.FC<TradeIntentBuilderProps> = ({
  showHeader = false,
  className = "",
  onCreateIntent
}) => {
  // Core state
  const [mode, setMode] = useState<'same-chain' | 'cross-chain'>('same-chain');
  const [amount, setAmount] = useState('100');
  const [sourceToken, setSourceToken] = useState('SUI');
  const [sourceChain, setSourceChain] = useState('SUI');
  const [targetToken, setTargetToken] = useState('USDC');
  const [targetChain, setTargetChain] = useState('SUI');

  // Advanced settings
  const [slippage, setSlippage] = useState('0.5');
  const [deadline, setDeadline] = useState('20');
  const [condition, setCondition] = useState('immediately at market rate');
  const [hasCondition, setHasCondition] = useState(true);

  // UI state
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [tempValue, setTempValue] = useState('');

  // Chain configurations
  const sameChainNetworks = [
    { name: 'Ethereum', logo: '⟠' },
    { name: 'Base', logo: '🔵' },
    { name: 'Polygon', logo: '🟣' },
    { name: 'BNB Chain', logo: '🟡' },
    { name: 'SUI', logo: '🔷' },
    { name: 'Cronos', logo: '⚫' },
    { name: 'Optimism', logo: '🔴' }
  ];

  const crossChainNetworks = [
    { name: 'Ethereum', logo: '⟠' },
    { name: 'SUI', logo: '🔷' }
  ];

  const tokens = [
    { name: 'SUI', price: '$2.45', icon: '🔷', balance: '250.00' },
    { name: 'USDC', price: '$1.00', icon: '💚', balance: '1,250.00' },
    { name: 'ETH', price: '$3,240', icon: '⟠', balance: '0.75' },
    { name: 'USDT', price: '$1.00', icon: '💛', balance: '500.00' },
    { name: 'WBTC', price: '$67,450', icon: '🟠', balance: '0.01' },
    { name: 'MATIC', price: '$0.85', icon: '🟣', balance: '500.00' },
    { name: 'BNB', price: '$590', icon: '🟡', balance: '2.50' },
    { name: 'OP', price: '$2.80', icon: '🔴', balance: '100.00' }
  ];

  const availableChains = mode === 'same-chain' ? sameChainNetworks : crossChainNetworks;

  // Effect to handle mode changes
  useEffect(() => {
    if (mode === 'same-chain') {
      setTargetChain(sourceChain);
      setCondition(`immediately at market rate with ${slippage}% slippage, expires in ${deadline} minutes`);
    } else {
      if (sourceChain === 'SUI') {
        setTargetChain('Ethereum');
        setSourceToken('SUI');
        setTargetToken('ETH');
      } else {
        setTargetChain('SUI');
        setSourceToken('ETH');
        setTargetToken('SUI');
      }
      setCondition(`when bridge rate is favorable with ${slippage}% slippage, complete within ${deadline} minutes`);
    }
  }, [mode, sourceChain, slippage, deadline]);

  const conditionTemplates = mode === 'same-chain' ? [
    `immediately at market rate`,
    'when rate improves by 3%',
    sourceChain !== "SUI" ? 'when gas fees drop below 20 gwei' : 'when network fees are low',
    'within next hour at best rate',
    'when liquidity is optimal'
  ] : [
    `immediately at best available cross-chain rate`,
    'when cross-chain fees are minimal',
    'when both networks have low congestion',
    targetChain !== "SUI" ? 'when gas fees drop below 20 gwei' : `when ${targetChain} destination fees are low`,
    'immediately via fastest bridge',
    'when arbitrage opportunity exists'
  ];

  const rateData = {
    currentRate: mode === 'cross-chain' ? '1,322.45' : '2.45',
    priceChange: mode === 'cross-chain' ? '-5.8' : '+2.3',
    volume24h: mode === 'cross-chain' ? '$12.5M' : '$15.2M',
    estimatedOutput: mode === 'cross-chain'
      ? (parseFloat(amount) * (sourceToken === 'SUI' ? 1322.45 : 0.000756)).toFixed(sourceToken === 'SUI' ? 2 : 6)
      : (parseFloat(amount) * 2.45).toFixed(2),
    networkFee: mode === 'cross-chain' ? '12.50' : '2.50',
    executionTime: mode === 'cross-chain' ? '~2-5 min' : '~30s',
    slippage: `${slippage}%`
  };

  const openModal = (type: string, currentValue: string = '') => {
    setModalType(type);
    setTempValue(currentValue);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType('');
    setTempValue('');
  };

  const saveValue = () => {
    switch (modalType) {
      case 'amount':
        setAmount(tempValue);
        break;
      case 'sourceToken':
        setSourceToken(tempValue);
        break;
      case 'targetToken':
        setTargetToken(tempValue);
        break;
      case 'sourceChain':
        setSourceChain(tempValue);
        if (mode === 'same-chain') {
          setTargetChain(tempValue);
        }
        break;
      case 'targetChain':
        setTargetChain(tempValue);
        break;
      case 'condition':
        setCondition(tempValue);
        break;
    }
    closeModal();
  };

  const selectOption = (value: string) => {
    setTempValue(value);
  };

  const handleCreateIntent = async () => {
    const intentData = {
      amount,
      sourceToken,
      sourceChain,
      targetToken,
      targetChain,
      condition: hasCondition ? condition : null,
      estimatedOutput: rateData.estimatedOutput,
      mode,
      slippage,
      deadline
    };

    if (onCreateIntent) {
      onCreateIntent(intentData);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div className=" mx-auto">

        {/* Main Intent Builder */}
        <motion.div
          className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Large Intent Display - Using Original Natural Format */}
          <div className="bg-slate-900/50 rounded-xl p-8 mb-8 pt-16 border border-slate-600/30 relative group">
            <div className="text-2xl md:text-3xl lg:text-4xl font-medium text-white leading-relaxed text-center">
              <span className="text-slate-300">Swap </span>
              <motion.button
                className="text-blue-400 hover:text-blue-300 underline decoration-dashed decoration-2 underline-offset-4 transition-all duration-200 hover:bg-blue-500/10 px-2 py-1 rounded-lg"
                onClick={() => openModal('amount', amount)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {amount}
              </motion.button>{' '}
              <motion.button
                className="text-green-400 hover:text-green-300 underline decoration-dashed decoration-2 underline-offset-4 transition-all duration-200 hover:bg-green-500/10 px-2 py-1 rounded-lg"
                onClick={() => openModal('sourceToken', sourceToken)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {sourceToken}
              </motion.button>{' '}
              <span className="text-slate-300">on </span>
              <motion.button
                className="text-purple-400 hover:text-purple-300 underline decoration-dashed decoration-2 underline-offset-4 transition-all duration-200 hover:bg-purple-500/10 px-2 py-1 rounded-lg"
                onClick={() => openModal('sourceChain', sourceChain)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {sourceChain}
              </motion.button>
              <span className="text-slate-300"> to </span>
              <motion.button
                className="text-green-400 hover:text-green-300 underline decoration-dashed decoration-2 underline-offset-4 transition-all duration-200 hover:bg-green-500/10 px-2 py-1 rounded-lg"
                onClick={() => openModal('targetToken', targetToken)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {targetToken}
              </motion.button>{' '}
              {mode === 'cross-chain' && (
                <>
                  <span className="text-slate-300">on </span>
                  <motion.button
                    className="text-purple-400 hover:text-purple-300 underline decoration-dashed decoration-2 underline-offset-4 transition-all duration-200 hover:bg-purple-500/10 px-2 py-1 rounded-lg"
                    onClick={() => openModal('targetChain', targetChain)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {targetChain}
                  </motion.button>
                </>
              )}
              {hasCondition && (
                <>
                  <br className="hidden lg:block" />
                  <span className="text-slate-300"> </span>
                  <motion.button
                    className="text-yellow-400 hover:text-yellow-300 underline decoration-dashed decoration-2 underline-offset-4 transition-all duration-200 hover:bg-yellow-500/10 px-2 py-1 rounded-lg"
                    onClick={() => openModal('condition', condition)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {condition}
                  </motion.button>
                  <button
                    className="ml-3 text-red-400 hover:text-red-300 transition-colors"
                    onClick={() => setHasCondition(false)}
                  >
                    <X size={24} />
                  </button>
                </>
              )}
            </div>

            {!hasCondition && (
              <motion.div
                className="text-center mt-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <button
                  className="text-yellow-400 hover:text-yellow-300 text-lg underline decoration-dashed decoration-2 underline-offset-4 transition-colors flex items-center gap-2 mx-auto"
                  onClick={() => setHasCondition(true)}
                >
                  <Zap size={20} />
                  Add execution condition
                </button>
              </motion.div>
            )}

            {/* Settings Button */}
            <div className="absolute top-4 right-4">
              <div className='flex flex-row space-x-1.5'>
                <button
                  onClick={() => setMode('same-chain')}
                  className={`flex-1 w-[120px]  p-2 rounded-lg transition-all duration-200 ${mode === 'same-chain'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                    }`}
                >
                  <span className="text-sm">Same Chain</span>
                </button>
                <button
                  onClick={() => setMode('cross-chain')}
                  className={`flex-1 w-[120px] p-2 rounded-lg transition-all duration-200 ${mode === 'cross-chain'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                    }`}
                >
                  <span className="text-sm">Cross Chain</span>
                </button>
                <button
                  onClick={() => openModal('settings')}
                  className="bg-slate-700/80 hover:bg-slate-600 text-slate-300 hover:text-white p-2 rounded-lg transition-all duration-200 flex items-center gap-2"
                >
                  <Settings size={16} />
                  <span className="text-sm">Settings</span>
                </button>
              </div>

            </div>

            {/* Hover hint */}
            <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-slate-700/80 text-slate-300 text-xs px-2 py-1 rounded-md">
                Click to edit
              </div>
            </div>
          </div>
          
          {/* Rate Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-700/30 rounded-lg p-4">
              <div className="text-slate-400 text-sm mb-1">Current Rate</div>
              <div className="text-xl font-bold text-white">
                1 {sourceToken} = {mode === 'cross-chain' && sourceToken === 'SUI' ? '1,322.45' :
                  mode === 'cross-chain' && sourceToken === 'ETH' ? '0.000756' : '2.45'} {targetToken}
              </div>
              <div className={`text-sm flex items-center gap-1 ${parseFloat(rateData.priceChange) > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                <TrendingUp size={14} />
                {rateData.priceChange}% (24h)
              </div>
            </div>

            <div className="bg-slate-700/30 rounded-lg p-4">
              <div className="text-slate-400 text-sm mb-1">You'll Receive</div>
              <div className="text-xl font-bold text-white">≈ {rateData.estimatedOutput} {targetToken}</div>
              <div className="text-blue-400 text-sm">Est. output</div>
            </div>

            <div className="bg-slate-700/30 rounded-lg p-4">
              <div className="text-slate-400 text-sm mb-1">Execution Time</div>
              <div className="text-xl font-bold text-white">{rateData.executionTime}</div>
              <div className="text-blue-400 text-sm flex items-center gap-1">
                <Clock size={14} />
                Via resolver
              </div>
            </div>

            <div className="bg-slate-700/30 rounded-lg p-4">
              <div className="text-slate-400 text-sm mb-1">Total Fee</div>
              <div className="text-xl font-bold text-white">${rateData.networkFee}</div>
              <div className="text-green-400 text-sm flex items-center gap-1">
                <Shield size={14} />
                Resolver + network
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="bg-slate-700/20 rounded-lg p-4 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">24h Volume:</span>
                <span className="text-white">{rateData.volume24h}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Max Slippage:</span>
                <span className="text-white">{rateData.slippage}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Deadline:</span>
                <span className="text-white">{deadline} minutes</span>
              </div>
            </div>
          </div>

          {/* Create Order Button */}
          <div className="text-center">
            <motion.button
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCreateIntent}
            >
              Create Intent Order
              <ArrowRight size={20} />
            </motion.button>
            <p className="text-slate-400 text-sm mt-3">
              Intent executed by trusted resolvers • {mode === 'cross-chain' ? 'Cross-chain bridging' : 'Same-chain swapping'} • Cancel anytime before execution
            </p>
          </div>
        </motion.div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="bg-slate-800 rounded-2xl border border-slate-600 p-6 max-w-md w-full shadow-2xl max-h-[80vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-xl font-semibold text-white">
                  {modalType === 'amount' && 'Set Amount'}
                  {modalType === 'sourceToken' && 'Select Source Token'}
                  {modalType === 'targetToken' && 'Select Target Token'}
                  {modalType === 'sourceChain' && 'Select Source Chain'}
                  {modalType === 'targetChain' && 'Select Target Chain'}
                  {modalType === 'condition' && 'Set Execution Condition'}
                  {modalType === 'settings' && 'Advanced Settings'}
                </h4>
                <button
                  onClick={closeModal}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="space-y-3 mb-6">
                {modalType === 'amount' && (
                  <div>
                    <input
                      type="text"
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white text-lg focus:border-blue-500 focus:outline-none"
                      placeholder="Enter amount"
                      autoFocus
                    />
                    <div className="mt-2 text-slate-400 text-sm">
                      Available balance: {tokens.find(t => t.name === sourceToken)?.balance} {sourceToken}
                    </div>
                  </div>
                )}

                {modalType === 'settings' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Slippage Tolerance
                      </label>
                      <div className="flex gap-2 mb-3">
                        {['0.1', '0.5', '1.0'].map((value) => (
                          <button
                            key={value}
                            onClick={() => setSlippage(value)}
                            className={`px-3 py-2 rounded-lg text-sm transition-colors ${slippage === value
                              ? 'bg-blue-500 text-white'
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                              }`}
                          >
                            {value}%
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        value={slippage}
                        onChange={(e) => setSlippage(e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                        placeholder="Custom %"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Transaction Deadline
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={deadline}
                          onChange={(e) => setDeadline(e.target.value)}
                          className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                        />
                        <span className="text-slate-400 text-sm">minutes</span>
                      </div>
                    </div>
                  </div>
                )}

                {(modalType === 'sourceChain' || modalType === 'targetChain') &&
                  availableChains.map((chain) => (
                    <motion.button
                      key={chain.name}
                      className={`flex items-center gap-3 w-full p-4 rounded-lg border transition-all ${tempValue === chain.name
                        ? 'bg-blue-500/20 border-blue-500/50 text-white'
                        : 'bg-slate-700 border-slate-600 hover:bg-slate-600 text-slate-300'
                        }`}
                      onClick={() => selectOption(chain.name)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="text-2xl">{chain.logo}</span>
                      <div className="text-left">
                        <div className="font-medium">{chain.name}</div>
                        <div className="text-sm text-slate-400">
                          {mode === 'same-chain' ? 'DEX execution' : 'Bridge compatible'}
                        </div>
                      </div>
                    </motion.button>
                  ))
                }

                {(modalType === 'sourceToken' || modalType === 'targetToken') &&
                  tokens.map((token) => (
                    <motion.button
                      key={token.name}
                      className={`flex items-center gap-3 w-full p-4 rounded-lg border transition-all ${tempValue === token.name
                        ? 'bg-green-500/20 border-green-500/50 text-white'
                        : 'bg-slate-700 border-slate-600 hover:bg-slate-600 text-slate-300'
                        }`}
                      onClick={() => selectOption(token.name)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="text-2xl">{token.icon}</span>
                      <div className="text-left flex-1">
                        <div className="font-medium">{token.name}</div>
                        <div className="text-sm text-slate-400">{token.price}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-slate-400">Balance</div>
                        <div className="text-sm text-white">{token.balance}</div>
                      </div>
                    </motion.button>
                  ))
                }

                {modalType === 'condition' && (
                  <div>
                    <input
                      type="text"
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-yellow-500 focus:outline-none mb-4"
                      placeholder={mode === 'same-chain' ? 'immediately at market rate' : 'when bridge rate is favorable'}
                      autoFocus
                    />

                    <div className="text-slate-400 text-sm mb-3">Quick templates:</div>
                    <div className="space-y-2">
                      {conditionTemplates.map((template, index) => (
                        <button
                          key={index}
                          className="block w-full text-left p-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 hover:text-white transition-colors text-sm"
                          onClick={() => setTempValue(template)}
                        >
                          {template}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3">
                <button
                  onClick={closeModal}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveValue}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg transition-colors"
                  disabled={!tempValue && modalType !== 'settings'}
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TradeIntentBuilder;
