"use client"

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, ChevronDown, Zap, Clock, ArrowRight, Shield, DollarSign } from 'lucide-react';

interface IntentBuilderProps {
  showHeader?: boolean;
  showRates?: boolean;
  className?: string;
  onCreateIntent?: (intentData: any) => void;
}

const IntentBuilderSection: React.FC<IntentBuilderProps> = ({ 
  showHeader = true, 
  showRates = true, 
  className = "",
  onCreateIntent 
}) => {

  const [amount, setAmount] = useState('100');
  const [sourceToken, setSourceToken] = useState('SUI');
  const [sourceChain, setSourceChain] = useState('SUI');
  const [targetToken, setTargetToken] = useState('USDC');
  const [targetChain, setTargetChain] = useState('Ethereum');
  const [condition, setCondition] = useState('when rate hits $2.50');
  const [hasCondition, setHasCondition] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [tempValue, setTempValue] = useState('');

  const chains = [
    { name: 'SUI', logo: '🔷', color: 'text-blue-400', type: 'Move VM' },
    { name: 'Ethereum', logo: '⟠', color: 'text-purple-400', type: 'EVM Compatible' },
    { name: 'Arbitrum', logo: '🔵', color: 'text-blue-300', type: 'EVM Compatible' },
    { name: 'Polygon', logo: '🟣', color: 'text-purple-300', type: 'EVM Compatible' },
    { name: 'Base', logo: '🔵', color: 'text-blue-200', type: 'EVM Compatible' }
  ];

  const tokens = [
    { name: 'SUI', price: '$2.45', icon: '🔷', balance: '250.00' },
    { name: 'USDC', price: '$1.00', icon: '💚', balance: '1,250.00' },
    { name: 'ETH', price: '$3,240', icon: '⟠', balance: '0.75' },
    { name: 'USDT', price: '$1.00', icon: '💛', balance: '500.00' },
    { name: 'BTC', price: '$67,450', icon: '🟠', balance: '0.01' }
  ];

  const conditionTemplates = [
    'when rate hits $2.50',
    'when rate drops below $2.30',
    'when rate rises above $2.60',
    'within next 24 hours',
    'when volume exceeds $1M',
    'immediately at market rate'
  ];

  const rateData = {
    currentRate: '2.45',
    priceChange: '+2.3',
    volume24h: '$12.5M',
    spread: '0.05%',
    estimatedOutput: (parseFloat(amount) * 2.45).toFixed(2),
    networkFee: '0.12',
    executionTime: '~30s',
    slippage: '0.1%'
  };

  const openModal = (type: any, currentValue: string = '') => {
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

  const selectOption = (value: any) => {
    setTempValue(value);
  };

  const handleCreateIntent = () => {
    const intentData = {
      amount,
      sourceToken,
      sourceChain,
      targetToken,
      targetChain,
      condition: hasCondition ? condition : null,
      estimatedOutput: rateData.estimatedOutput
    };
    
    if (showHeader) {
      // On landing page, navigate to trade page
      window.location.href = '/trade';
    } else if (onCreateIntent) {
      // On trade page, execute the callback
      onCreateIntent(intentData);
    }
  };

  return (
    <div className={`w-full ${showHeader ? 'py-20' : 'py-0'} ${className}`}>
      <div className="max-w-6xl mx-auto px-4 md:px-10">
        {/* Header */}
        {showHeader && (
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Define Your Intent
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Set up intelligent cross-chain swaps with custom execution conditions. Click any parameter to customize your intent.
            </p>
          </motion.div>
        )}

        {/* Main Intent Builder */}
        <motion.div
          className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8 mb-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          {/* Large Intent Display */}
          <div className="bg-slate-900/50 rounded-xl p-8 mb-8 border border-slate-600/30 relative group">
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
              <span className="text-slate-300">on </span>
              <motion.button
                className="text-purple-400 hover:text-purple-300 underline decoration-dashed decoration-2 underline-offset-4 transition-all duration-200 hover:bg-purple-500/10 px-2 py-1 rounded-lg"
                onClick={() => openModal('targetChain', targetChain)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {targetChain}
              </motion.button>
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
                  Add condition
                </button>
              </motion.div>
            )}

            {/* Hover hint */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-slate-700/80 text-slate-300 text-xs px-2 py-1 rounded-md">
                Click to edit
              </div>
            </div>
          </div>

          {/* Rate Information */}
          {showRates && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-slate-700/30 rounded-lg p-4">
                <div className="text-slate-400 text-sm mb-1">Current Rate</div>
                <div className="text-xl font-bold text-white">1 {sourceToken} = ${rateData.currentRate}</div>
                <div className="text-green-400 text-sm flex items-center gap-1">
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
                  Avg. settlement
                </div>
              </div>
              
              <div className="bg-slate-700/30 rounded-lg p-4">
                <div className="text-slate-400 text-sm mb-1">Network Fee</div>
                <div className="text-xl font-bold text-white">${rateData.networkFee}</div>
                <div className="text-green-400 text-sm flex items-center gap-1">
                  <DollarSign size={14} />
                  Gas optimized
                </div>
              </div>
            </div>
          )}

          {/* Additional Details */}
          {showRates && (
            <div className="bg-slate-700/20 rounded-lg p-4 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">24h Volume:</span>
                  <span className="text-white">{rateData.volume24h}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Spread:</span>
                  <span className="text-white">{rateData.spread}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Max Slippage:</span>
                  <span className="text-white">{rateData.slippage}</span>
                </div>
              </div>
            </div>
          )}

          {/* Create Order Button */}
          <div className="text-center">
            <motion.button
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCreateIntent}
            >
              <Shield size={20} />
              {showHeader ? 'Try It Now' : 'Create Intent Order'}
              <ArrowRight size={20} />
            </motion.button>
            <p className="text-slate-400 text-sm mt-3">
              {showHeader 
                ? 'Experience intent-based trading • No registration required'
                : 'Protected by smart contract escrow • Cancel anytime before execution'
              }
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
              className="bg-slate-800 rounded-2xl border border-slate-600 p-6 max-w-md w-full shadow-2xl"
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
                  {modalType === 'condition' && 'Set Condition'}
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

                {(modalType === 'sourceChain' || modalType === 'targetChain') && 
                  chains.map((chain) => (
                    <motion.button
                      key={chain.name}
                      className={`flex items-center gap-3 w-full p-4 rounded-lg border transition-all ${
                        tempValue === chain.name
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
                        <div className="text-sm text-slate-400">{chain.type}</div>
                      </div>
                    </motion.button>
                  ))
                }

                {(modalType === 'sourceToken' || modalType === 'targetToken') && 
                  tokens.map((token) => (
                    <motion.button
                      key={token.name}
                      className={`flex items-center gap-3 w-full p-4 rounded-lg border transition-all ${
                        tempValue === token.name
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
                      placeholder="when rate hits $2.50"
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
                  disabled={!tempValue}
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

export default IntentBuilderSection;