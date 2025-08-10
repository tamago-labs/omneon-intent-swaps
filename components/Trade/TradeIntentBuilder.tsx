"use client"

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Zap, Clock, ArrowRight, Shield, Settings, Info, AlertCircle, CheckCircle, Wallet, BarChart3, Target } from 'lucide-react';
import { orderAPI } from '@/lib/api';
import { useWalletType } from '@/lib/wallet-type-context';
import { useResolvers } from '@/lib/hooks/useResolvers';
import { useTokenBalance, useTokenAllowance, useFeeCalculation, useTokenApproval, useCreateOrder, formatTokenAmount, parseTokenAmount, checkNeedsApproval } from '@/lib/hooks/useContracts';
import { useCreateIntentOrder } from '@/lib/hooks/useCreateIntentOrder';
import { getTokensForChain, ChainType, getTokenAddress, getContractsForChain } from '@/lib/contracts';
import { useRate } from '@/lib/hooks/useRate';
import { useTokenPricesForDisplay, useEstimatedOutput } from '@/lib/hooks/usePythPrices';
import { formatPrice } from '@/lib/services/pyth-price-service';
import { Address } from 'viem';
import { useRouter } from 'next/navigation';

// SUI imports
import { useSuiCreateIntentOrder } from '@/lib/sui/useSuiCreateIntentOrder';
import { useSuiTokenBalances } from '@/lib/sui/useSuiBalances';
import { SUI_TOKENS, getSuiTokenBySymbol } from '@/lib/sui/contracts';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';

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
  // Wallet and user context
  const { wallets } = useWalletType();
  const { selectedResolver, isLoading: resolversLoading } = useResolvers();
  const router = useRouter();
  const { createIntentOrder, isSubmitting, state: orderState } = useCreateIntentOrder();

  // SUI wallet and hooks
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const { createSuiIntentOrder, isSubmitting: isSuiSubmitting, state: suiOrderState } = useSuiCreateIntentOrder();
  const { balances: suiBalances } = useSuiTokenBalances(currentAccount?.address || null);

  // Core state
  const [mode, setMode] = useState<'same-chain' | 'cross-chain'>('same-chain');
  const [amount, setAmount] = useState('100');
  const [sourceToken, setSourceToken] = useState('WETH');
  const [sourceChain, setSourceChain] = useState('Ethereum');
  const [targetToken, setTargetToken] = useState('USDC');
  const [targetChain, setTargetChain] = useState('Ethereum');

  // Advanced settings
  const [slippage, setSlippage] = useState('0.5');
  const [deadline, setDeadline] = useState('20');
  const [condition, setCondition] = useState('immediately at market rate');
  const [hasCondition, setHasCondition] = useState(true);

  // UI state
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [tempValue, setTempValue] = useState('');
  const [showBalanceModal, setShowBalanceModal] = useState(false);

  // Error and success states
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingOrderData, setPendingOrderData] = useState<any>(null);

  // Get token info
  const sourceTokenInfo: any = sourceChain === 'SUI'
    ? getSuiTokenBySymbol(sourceToken)
    : getTokensForChain(sourceChain).find(t => t.symbol === sourceToken);
  const targetTokenInfo = targetChain === 'SUI'
    ? getSuiTokenBySymbol(targetToken)
    : getTokensForChain(targetChain).find(t => t.symbol === targetToken);

  // Get all token symbols for price fetching
  const allTokenSymbols = React.useMemo(() => {
    const sourceTokens = sourceChain === 'SUI'
      ? SUI_TOKENS.MAINNET.map(token => token.symbol)
      : getTokensForChain(sourceChain).map(token => token.symbol);
    
    const targetTokens = mode === 'same-chain' 
      ? sourceTokens
      : (targetChain === 'SUI'
          ? SUI_TOKENS.MAINNET.map(token => token.symbol)
          : getTokensForChain(targetChain).map(token => token.symbol));
    
    return [...new Set([...sourceTokens, ...targetTokens])];
  }, [sourceChain, targetChain, mode]);

  // Get live prices from Pyth Oracle
  const { getPriceForToken, getPriceChangeForToken, loading: pricesLoading } = useTokenPricesForDisplay(allTokenSymbols);

  // Get estimated output using Pyth prices with OKX fallback
  const pythEstimation = useEstimatedOutput(sourceToken, targetToken, amount, mode);

  // Get contracts for current source chain
  const currentContracts: any = sourceChain !== 'SUI' ? getContractsForChain(sourceChain) : null;

  // Contract hooks - get token balances dynamically based on selected chain
  const wethBalance: any = useTokenBalance(
    currentContracts?.WETH || ('0x0000000000000000000000000000000000000000' as Address),
    wallets.evm as Address
  );

  const usdcBalance: any = useTokenBalance(
    currentContracts?.USDC || ('0x0000000000000000000000000000000000000000' as Address),
    wallets.evm as Address
  );

  const usdtBalance: any = useTokenBalance(
    currentContracts?.USDT || ('0x0000000000000000000000000000000000000000' as Address),
    wallets.evm as Address
  );

  const wbtcBalance: any = useTokenBalance(
    currentContracts?.WBTC || ('0x0000000000000000000000000000000000000000' as Address),
    wallets.evm as Address
  );

  // Get current token balance
  const getCurrentBalance = () => {
    if (sourceChain === 'SUI') {
      return suiBalances[sourceToken] || '0.000000';
    }

    // For EVM chains, get balance based on token symbol
    if (sourceToken === 'WETH' && wethBalance.data && sourceTokenInfo) {
      return formatTokenAmount(wethBalance.data, sourceTokenInfo.decimals);
    } else if (sourceToken === 'USDC' && usdcBalance.data && sourceTokenInfo) {
      return formatTokenAmount(usdcBalance.data, sourceTokenInfo.decimals);
    } else if (sourceToken === 'USDT' && usdtBalance.data && sourceTokenInfo) {
      return formatTokenAmount(usdtBalance.data, sourceTokenInfo.decimals);
    } else if (sourceToken === 'WBTC' && wbtcBalance.data && sourceTokenInfo) {
      return formatTokenAmount(wbtcBalance.data, sourceTokenInfo.decimals);
    }
    return '0.00';
  };

  const { data: allowance } = useTokenAllowance(
    sourceTokenInfo?.address as any,
    wallets.evm as Address,
    currentContracts?.IntentRFQ || ('0x0000000000000000000000000000000000000000' as Address)
  );

  // Helper function to safely check approval
  const needsApproval = (amount: string) => {
    if (!sourceTokenInfo || !allowance) return true;
    const amountInWei = parseTokenAmount(amount, sourceTokenInfo.decimals);
    return checkNeedsApproval(allowance as bigint, amountInWei);
  };

  // Chain configurations
  const sameChainNetworks = [
    { name: 'Ethereum', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png' },
    { name: 'Base', logo: 'https://images.blockscan.com/chain-logos/base.svg' },
    { name: 'Optimism', logo: 'https://optimistic.etherscan.io/assets/optimism/images/svg/logos/token-secondary-light.svg?v=25.7.5.2' },
    { name: 'SUI', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/20947.png' }
  ];

  const crossChainNetworks = [
    { name: 'Ethereum', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png' },
    { name: 'SUI', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/20947.png' }
  ];

  const tokens = sourceChain === 'SUI'
    ? SUI_TOKENS.MAINNET.map(token => {
        const price = getPriceForToken(token.symbol);
        const priceChange = getPriceChangeForToken(token.symbol);
        return {
          name: token.symbol,
          price: price,
          priceChange: priceChange.change,
          isPositive: priceChange.isPositive,
          icon: token.icon,
          balance: suiBalances[token.symbol] || '0.000000',
          address: token.type,
          decimals: token.decimals
        };
      })
    : getTokensForChain(sourceChain).map(token => {
        let balance = '0.00';
        
        // Get balance based on token symbol
        if (token.symbol === 'WETH' && wethBalance.data) {
          balance = formatTokenAmount(wethBalance.data, token.decimals);
        } else if (token.symbol === 'USDC' && usdcBalance.data) {
          balance = formatTokenAmount(usdcBalance.data, token.decimals);
        } else if (token.symbol === 'USDT' && usdtBalance.data) {
          balance = formatTokenAmount(usdtBalance.data, token.decimals);
        } else if (token.symbol === 'WBTC' && wbtcBalance.data) {
          balance = formatTokenAmount(wbtcBalance.data, token.decimals);
        }
        
        const price = getPriceForToken(token.symbol);
        const priceChange = getPriceChangeForToken(token.symbol);
        
        return {
          name: token.symbol,
          price: price,
          priceChange: priceChange.change,
          isPositive: priceChange.isPositive,
          icon: token.icon,
          balance,
          address: token.address,
          decimals: token.decimals
        };
      });

  const availableChains = mode === 'same-chain' ? sameChainNetworks : crossChainNetworks;

  // Effect to handle mode changes
  useEffect(() => {
    if (mode === 'same-chain') {
      setTargetChain(sourceChain);
      setCondition(`immediately at market rate`);

      // Reset tokens when switching chains
      if (sourceChain === 'SUI') {
        setSourceToken('WETH');
        setTargetToken('USDC');
      } else {
        setSourceToken('WETH');
        setTargetToken('USDC');
      }
    } else {
      if (sourceChain === 'SUI') {
        setTargetChain('Ethereum');
        setSourceToken('WETH');
        setTargetToken('USDC');
      } else {
        setTargetChain('SUI');
        setSourceToken('WETH');
        setTargetToken('WETH');
      }
      setCondition(`immediately at best available cross-chain rate`);
    }
  }, [mode, sourceChain, slippage, deadline]);

  // Clear errors after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

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

  // Get real-time rate using OKX API
  const { quote: rateQuote, loading: rateLoading, error: rateError } = useRate({
    sourceChain,
    sourceToken,
    targetChain: mode === 'same-chain' ? sourceChain : targetChain,
    targetToken,
    amount: amount || '1',
    refreshInterval: 30000, // Refresh every 30 seconds
    enabled: !!(amount && parseFloat(amount) > 0)
  });

  // Calculate rate data using Pyth prices with OKX fallback
  const rateData = {
    // Use Pyth estimation first, fallback to OKX quote
    estimatedOutput: pythEstimation.estimatedOutput,
    
    // Current exchange rate from Pyth or fallback
    currentRate: pythEstimation.currentRate,
    
    // Price impact
    priceImpact: pythEstimation.priceImpact,
    
    // Execution time based on mode
    executionTime: mode === 'cross-chain' ? '2-5 min' : '15-45s',
    
    // Expected value after slippage using Pyth estimation
    minReceived: (
      parseFloat(pythEstimation.estimatedOutput) * (1 - parseFloat(slippage) / 100)
    ).toFixed(6),
    
    // Route information (fallback to OKX route if available)
    route: rateQuote?.route || (mode === 'cross-chain' ? ['Pyth Oracle', 'Bridge', 'DEX'] : ['Pyth Oracle', 'Uniswap V3']),
    
    // Slippage setting
    slippage: `${slippage}%`,
    
    // Data source indicator
    source: pythEstimation.source,
    
    // Loading state
    loading: pythEstimation.loading || rateLoading
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
    setError(null);

    // Validate wallet connection
    if (sourceChain === 'SUI') {
      if (!currentAccount?.address) {
        setError('Please connect your SUI wallet first');
        return;
      }
    } else {
      if (!wallets.evm) {
        setError('Please connect your wallet first');
        return;
      }
    }

    // Validate amount
    const balance = getCurrentBalance();
    if (parseFloat(amount) > parseFloat(balance)) {
      setError(`Insufficient balance. You have ${balance} ${sourceToken}`);
      return;
    }

    // Validate that source and destination tokens are different
    if (sourceToken === targetToken && sourceChain === targetChain) {
      setError('Source and destination tokens cannot be the same');
      return;
    }

    // Calculate min amount out with slippage
    const estimatedOutput = parseFloat(rateData.estimatedOutput);
    const slippageMultiplier = 1 - (parseFloat(slippage) / 100);
    const minAmountOut = (estimatedOutput * slippageMultiplier).toString();

    const orderData = {
      sourceChain,
      sourceToken,
      amount,
      destChain: mode === 'same-chain' ? sourceChain : targetChain,
      destToken: targetToken,
      minAmountOut,
      slippage,
      deadline,
      condition: hasCondition ? condition : undefined,
      estimatedOutput: rateData.estimatedOutput,
      mode,
      userAddress: sourceChain === 'SUI' ? currentAccount?.address : wallets.evm,
      needsApproval: sourceChain === 'SUI' ? false : needsApproval(amount)
    };

    setPendingOrderData(orderData);
    setShowConfirmModal(true);
  };

  const confirmCreateOrder = async () => {
    if (!pendingOrderData) return;

    setShowConfirmModal(false);

    try {
      let result: any;

      if (sourceChain === 'SUI') {
        // Handle SUI order creation
        result = await createSuiIntentOrder({
          sourceToken: pendingOrderData.sourceToken,
          amount: pendingOrderData.amount,
          destToken: pendingOrderData.destToken,
          minAmountOut: pendingOrderData.minAmountOut,
          slippage: pendingOrderData.slippage,
          deadline: pendingOrderData.deadline,
          condition: pendingOrderData.condition,
          userAddress: pendingOrderData.userAddress
        }, signAndExecuteTransaction);
      } else {
        // Handle EVM order creation
        result = await createIntentOrder({
          ...pendingOrderData,
          needsApproval: pendingOrderData.needsApproval
        });
      }

      if (result && result.success) {
        setSuccessMessage(`Order created successfully! ID: ${result.intentId?.slice(0, 8)}...`);

        // Redirect to orders page after 2 seconds
        setTimeout(() => {
          router.push('/orders');
        }, 2000);
      }
    } catch (error: any) {
      console.error('Error creating order:', error);
      setError(error.message || 'Failed to create order');
    } finally {
      setPendingOrderData(null);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="mx-auto">
        {/* Main Intent Builder */}
        <motion.div
          className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Error Alert */}
          <AnimatePresence>
            {error && (
              <motion.div
                className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 flex items-center gap-3"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <AlertCircle className="text-red-400" size={20} />
                <span className="text-red-400 flex-1">{error}</span>
                <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
                  <X size={20} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success Alert */}
          <AnimatePresence>
            {successMessage && (
              <motion.div
                className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6 flex items-center gap-3"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <CheckCircle className="text-green-400" size={20} />
                <span className="text-green-400 flex-1">{successMessage}</span>
                <button onClick={() => setSuccessMessage(null)} className="text-green-400 hover:text-green-300">
                  <X size={20} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Order State Indicator */}
          {(orderState !== 'idle' || suiOrderState !== 'idle') && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                {((orderState === 'checking' || suiOrderState === 'checking')) && (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400" />
                    <span className="text-blue-400">Checking {sourceChain === 'SUI' ? 'SUI wallet' : 'allowance'}...</span>
                  </>
                )}
                {((orderState === 'approving')) && (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400" />
                    <span className="text-blue-400">Approving token spend...</span>
                  </>
                )}
                {((orderState === 'creating' || suiOrderState === 'creating')) && (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400" />
                    <span className="text-blue-400">Creating order on {sourceChain === 'SUI' ? 'SUI' : 'blockchain'}...</span>
                  </>
                )}
                {((orderState === 'success' || suiOrderState === 'success')) && (
                  <>
                    <CheckCircle className="text-green-400" size={20} />
                    <span className="text-green-400">Order created successfully!</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Large Intent Display */}
          <div className={`bg-slate-900/50 rounded-xl p-8 mb-8 pt-20 border relative group ${sourceToken === targetToken && sourceChain === targetChain
              ? 'border-red-500/50 bg-red-500/5'
              : 'border-slate-600/30'
            }`}>
            {/* Same token warning */}
            {sourceToken === targetToken && sourceChain === targetChain && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-500/20 border border-red-500/50 rounded-lg px-3 py-1 flex items-center gap-2">
                <AlertCircle className="text-red-400" size={16} />
                <span className="text-red-400 text-sm">Source and destination cannot be the same</span>
              </div>
            )}

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
                  className={`flex-1 w-[120px] p-2 rounded-lg transition-all duration-200 ${mode === 'same-chain'
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

          {/* Enhanced Rate Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Expected Output */}
            <div className="bg-slate-700/30 rounded-lg p-4">
              <div className="text-slate-400 text-sm mb-1 flex items-center gap-2">
                <Target size={14} />
                You'll Receive
                {rateData.loading && (
                  <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-400" />
                )}
              </div>
              <div className="text-xl font-bold text-white">≈ {rateData.estimatedOutput} {targetToken}</div>
              <div className={`text-sm ${
                rateData.source === 'pyth' ? 'text-green-400' : 
                rateData.source === 'fallback' ? 'text-yellow-400' : 'text-blue-400'
              }`}>
                {rateData.source === 'pyth' ? '🔮 Live from Pyth Oracle' : 
                 rateData.source === 'fallback' ? '⚡ Fallback pricing' : 'Live from OKX'}
              </div>
            </div>

            {/* Current Exchange Rate */}
            <div className="bg-slate-700/30 rounded-lg p-4">
              <div className="text-slate-400 text-sm mb-1 flex items-center gap-2">
                <TrendingUp size={14} />
                Exchange Rate
                {rateData.loading && (
                  <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-400" />
                )}
              </div>
              <div className="text-xl font-bold text-white">
                1 {sourceToken} = {rateData.currentRate} {targetToken}
              </div>
              <div className="text-green-400 text-sm">
                Price Impact: {rateData.priceImpact}
              </div>
            </div>

            {/* Minimum Received */}
            <div className="bg-slate-700/30 rounded-lg p-4">
              <div className="text-slate-400 text-sm mb-1 flex items-center gap-2">
                <Shield size={14} />
                Min. Received
              </div>
              <div className="text-xl font-bold text-white">{rateData.minReceived} {targetToken}</div>
              <div className="text-yellow-400 text-sm">
                After {rateData.slippage} slippage
              </div>
            </div>

            {/* Execution Time */}
            <div className="bg-slate-700/30 rounded-lg p-4">
              <div className="text-slate-400 text-sm mb-1 flex items-center gap-2">
                <Clock size={14} />
                Execution Time
              </div>
              <div className="text-xl font-bold text-white">{rateData.executionTime}</div>
              <div className="text-purple-400 text-sm">
                {mode === 'cross-chain' ? 'Cross-chain' : 'Same-chain'}
              </div>
            </div>
          </div>

          {/* Route and Details */}
          <div className="bg-slate-700/20 rounded-lg p-4 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Route Information */}
              <div>
                <div className="text-slate-400 text-sm mb-2 flex items-center gap-2">
                  <BarChart3 size={14} />
                  Execution Route
                </div>
                <div className="flex items-center gap-2 text-white">
                  {rateData.route.map((step, index) => (
                    <React.Fragment key={index}>
                      <span className="bg-blue-500/20 px-2 py-1 rounded text-sm">{step}</span>
                      {index < rateData.route.length - 1 && (
                        <ArrowRight size={14} className="text-slate-400" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Transaction Details */}
              <div>
                <div className="text-slate-400 text-sm mb-2">Transaction Settings</div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Max Slippage:</span>
                    <span className="text-white">{rateData.slippage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Deadline:</span>
                    <span className="text-white">{deadline} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Protocol Fee:</span>
                    <span className="text-white">0.3%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Create Order Button */}
          <div className="text-center">
            <motion.button
              className={`bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto ${isSubmitting || isSuiSubmitting || orderState !== 'idle' || suiOrderState !== 'idle' || (sourceToken === targetToken && sourceChain === targetChain)
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
                }`}
              whileHover={!isSubmitting && !isSuiSubmitting && orderState === 'idle' && suiOrderState === 'idle' && !(sourceToken === targetToken && sourceChain === targetChain) ? { scale: 1.05, y: -2 } : {}}
              whileTap={!isSubmitting && !isSuiSubmitting && orderState === 'idle' && suiOrderState === 'idle' && !(sourceToken === targetToken && sourceChain === targetChain) ? { scale: 0.95 } : {}}
              onClick={handleCreateIntent}
              disabled={isSubmitting || isSuiSubmitting || orderState !== 'idle' || suiOrderState !== 'idle' || (sourceToken === targetToken && sourceChain === targetChain)}
            >
              {isSubmitting || isSuiSubmitting || orderState !== 'idle' || suiOrderState !== 'idle' ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  Processing...
                </>
              ) : sourceToken === targetToken && sourceChain === targetChain ? (
                <>
                  <AlertCircle size={20} />
                  Cannot swap same tokens
                </>
              ) : (
                <>
                  {sourceChain === 'SUI' ? 'Create SUI Intent Order' : (needsApproval(amount || '0') ? 'Approve & Create Order' : 'Create Intent Order')}
                  <ArrowRight size={20} />
                </>
              )}
            </motion.button>
            <p className="text-slate-400 text-sm mt-3">
              {mode === 'cross-chain' ? 'Cross-chain bridging' : 'Same-chain swapping'} • 0.3% protocol fee • Cancel anytime before execution
            </p>
          </div>
        </motion.div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showConfirmModal && pendingOrderData && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              className="bg-slate-800 rounded-2xl border border-slate-600 p-6 max-w-md w-full shadow-2xl"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
            >
              <h3 className="text-xl font-bold text-white mb-4">Preview Intent Order</h3>

              <div className="space-y-4 mb-6">
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="text-slate-400 text-sm mb-2">You're Trading</div>
                  <div className="text-white font-medium">
                    {pendingOrderData.amount} {pendingOrderData.sourceToken} on {pendingOrderData.sourceChain}
                  </div>
                </div>

                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="text-slate-400 text-sm mb-2">You'll Receive</div>
                  <div className="text-white font-medium">
                    ≈ {pendingOrderData.estimatedOutput} {pendingOrderData.destToken}
                    {pendingOrderData.mode === 'cross-chain' && ` on ${pendingOrderData.destChain}`}
                  </div>
                </div>

                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="text-slate-400 text-sm mb-2">Execution Type</div>
                  <div className="text-white font-medium">
                    {pendingOrderData.mode === 'cross-chain' ? 'Cross-Chain Bridge' : 'Same-Chain Swap'}
                  </div>
                </div>

                {pendingOrderData.needsApproval && sourceChain !== 'SUI' && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-yellow-400 text-sm mb-1">
                      <AlertCircle size={16} />
                      Token Approval Required
                    </div>
                    <div className="text-white text-sm">This transaction will first approve token spending, then create the order.</div>
                  </div>
                )}

                {sourceChain === 'SUI' && (
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-blue-400 text-sm mb-1">
                      <Info size={16} />
                      SUI Network Transaction
                    </div>
                    <div className="text-white text-sm">This transaction will be executed on the SUI network using your connected SUI wallet.</div>
                  </div>
                )}

                {pendingOrderData.condition && (
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-blue-400 text-sm mb-1">
                      <Info size={16} />
                      Execution Condition
                    </div>
                    <div className="text-white">{pendingOrderData.condition}</div>
                  </div>
                )}

                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="text-slate-400 text-sm mb-2">Transaction Details</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Resolver Fee:</span>
                      <span className="text-white">0.3%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Est. Time:</span>
                      <span className="text-white">
                        {pendingOrderData.mode === 'cross-chain' ? '2-5 minutes' : '~30 seconds'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Max Slippage:</span>
                      <span className="text-white">{pendingOrderData.slippage}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={confirmCreateOrder}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg transition-colors"
                >
                  Submit Intent
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Settings and Token Selection Modal */}
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
                      <img src={chain.logo} alt={chain.name} className="w-8 h-8 rounded-full" />
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
                      <img src={token.icon} alt={token.name} className="w-8 h-8 rounded-full" />
                      <div className="text-left flex-1">
                        <div className="font-medium">{token.name}</div>
                        <div className="text-sm flex items-center gap-1">
                          <span className="text-slate-400">{token.price}</span>
                          {token.priceChange !== undefined && (
                            <span className={`text-xs ${
                              token.isPositive ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {token.isPositive ? '+' : ''}{token.priceChange.toFixed(2)}%
                            </span>
                          )}
                          {pricesLoading && (
                            <div className="animate-spin rounded-full h-2 w-2 border border-slate-400" />
                          )}
                        </div>
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