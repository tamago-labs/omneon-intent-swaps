 
import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import { useIntentOrderCreation } from './useContracts';
import { orderAPI, resolverAPI } from '@/lib/api';
import { getTokenAddress, getChainId, getChainType, parseTokenAmount } from '@/lib/contracts';
import { useResolvers } from './useResolvers';

interface CreateIntentOrderParams {
  sourceChain: string;
  sourceToken: string;
  amount: string;
  destChain: string;
  destToken: string;
  minAmountOut: string;
  slippage: string;
  deadline: string;
  condition?: string;
}

export function useCreateIntentOrder() {
  const { address: userAddress } = useAccount();
  const { selectedResolver } = useResolvers();
  const { submitOrder, state, error, intentId, txHash } = useIntentOrderCreation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createIntentOrder = async (params: CreateIntentOrderParams) => {
    if (!userAddress) {
      throw new Error('Wallet not connected');
    }

    if (!selectedResolver) {
      throw new Error('No resolver selected');
    }

    setIsSubmitting(true);

    try {
      // Get token addresses and info
      const sourceTokenAddress = getTokenAddress(params.sourceToken, params.sourceChain);
      const destTokenAddress = getTokenAddress(params.destToken, params.destChain);
      
      // Get token decimals (you might want to fetch these dynamically)
      const sourceTokenDecimals = params.sourceToken === 'USDC' ? 6 : 
                                  params.sourceToken === 'WBTC' ? 8 : 18;
      const destTokenDecimals = params.destToken === 'USDC' ? 6 : 
                                params.destToken === 'WBTC' ? 8 : 18;

      // Calculate min amount out based on slippage
      const expectedOutput = parseFloat(params.amount) * 2.45; // Mock rate, replace with actual
      const slippageMultiplier = 1 - (parseFloat(params.slippage) / 100);
      const minAmountOut = (expectedOutput * slippageMultiplier).toString();

      // Step 1: Submit to smart contract
      const result = await submitOrder({
        sourceChain: params.sourceChain,
        sourceToken: params.sourceToken,
        sourceTokenAddress: sourceTokenAddress as Address,
        sourceTokenDecimals,
        amount: params.amount,
        destChain: params.destChain,
        destToken: params.destToken,
        destTokenAddress: destTokenAddress as Address,
        minAmountOut,
        resolver: selectedResolver.address as Address
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to create order on blockchain');
      }

      // Step 2: Save to database after successful blockchain transaction
      const orderData = {
        intentId: result.intentId!,
        userAddress: userAddress.toLowerCase(),
        resolverAddress: selectedResolver.address.toLowerCase(),
        sourceChainType: getChainType(params.sourceChain).toString(),
        sourceChainId: getChainId(params.sourceChain),
        sourceTokenAddress: sourceTokenAddress.toLowerCase(),
        sourceTokenSymbol: params.sourceToken,
        sourceTokenDecimals,
        amountIn: parseTokenAmount(params.amount, sourceTokenDecimals).toString(),
        destChainType: getChainType(params.destChain).toString(),
        destChainId: getChainId(params.destChain),
        destTokenAddress: destTokenAddress.toLowerCase(),
        destTokenSymbol: params.destToken,
        destTokenDecimals,
        minAmountOut: parseTokenAmount(minAmountOut, destTokenDecimals).toString(),
        status: 'PENDING',
        txHashSource: result.txHash,
        blockNumberSource: 0, // Will be updated when transaction is mined
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + parseInt(params.deadline) * 60 * 1000).toISOString(),
        retryCount: 0
      };

      const savedOrder = await orderAPI.createOrder(orderData);

      // Step 3: Update resolver metrics
      // await resolverAPI.getResolverMetrics(selectedResolver.address);

      return {
        success: true,
        intentId: result.intentId,
        txHash: result.txHash,
        order: savedOrder
      };

    } catch (error: any) {
      console.error('Error creating intent order:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    createIntentOrder,
    isSubmitting,
    state,
    error,
    intentId,
    txHash
  };
}