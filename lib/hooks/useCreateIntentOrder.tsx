 
import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import { useIntentOrderCreation } from './useContracts';
import { orderAPI, resolverAPI, userAPI} from '@/lib/api';
import { getTokenAddress, getChainId, getChainType, parseTokenAmount, EVM_RESOLVER_ADDRESS } from '@/lib/contracts';
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
  needsApproval?: boolean;
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

    // Use hardcoded EVM resolver address
    const resolverAddress = EVM_RESOLVER_ADDRESS;

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
      const result: any = await submitOrder({
        sourceChain: params.sourceChain,
        sourceToken: params.sourceToken,
        sourceTokenAddress: sourceTokenAddress as Address,
        sourceTokenDecimals,
        amount: params.amount,
        destChain: params.destChain,
        destToken: params.destToken,
        destTokenAddress: destTokenAddress as Address,
        minAmountOut,
        resolver: resolverAddress as Address,
        needsApproval: params.needsApproval
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to create order on blockchain');
      }

      console.log('Blockchain transaction successful, saving to database...');
      console.log('Result from blockchain:', result);

      // Step 2: Ensure user and resolver records exist
      console.log('Ensuring user record exists...');
      const user = await userAPI.getOrCreateUser(
        userAddress.toLowerCase(), 
        getChainType(params.sourceChain),
        getChainId(params.sourceChain)
      );
      console.log('User record:', user);
      console.log('User ID will be:', user.id);

      // Check if resolver exists, get the first one from the list
      console.log('Getting first resolver from list...');
      const resolvers = await resolverAPI.getAllResolvers();
      
      if (!resolvers || resolvers.length === 0) {
        throw new Error('No resolvers available in the system');
      }
      
      const resolver = resolvers[0]; // Use the first resolver
      console.log('Using resolver:', resolver);

      // Step 3: Save order to database
      const orderData = {
        id: result.intentId!, // Use intentId as the primary ID
        intentId: result.intentId!,
        userId: user.id, // Use the user ID from the created/retrieved user
        resolverId: resolver.id, // Use the resolver ID
        senderAddress: userAddress.toLowerCase(), // CRITICAL: For refunds
        recipientAddress: userAddress.toLowerCase(), // CRITICAL: For successful transfers
        sourceChainType: getChainType(params.sourceChain),
        sourceChainId: getChainId(params.sourceChain),
        sourceTokenAddress: sourceTokenAddress.toLowerCase(),
        sourceTokenSymbol: params.sourceToken,
        sourceTokenDecimals,
        amountIn: parseTokenAmount(params.amount, sourceTokenDecimals).toString(),
        destChainType: getChainType(params.destChain),
        destChainId: getChainId(params.destChain),
        destTokenAddress: destTokenAddress.toLowerCase(),
        destTokenSymbol: params.destToken,
        destTokenDecimals,
        minAmountOut: parseTokenAmount(minAmountOut, destTokenDecimals).toString(),
        status: 'PENDING' as const,
        txHashSource: result.txHash,
        blockNumberSource: 0, // Will be updated when transaction is mined
        expiresAt: new Date(Date.now() + parseInt(params.deadline) * 60 * 1000).toISOString(),
        retryCount: 0,
        // Only include executionCondition if there's a condition, and stringify it
        ...(params.condition && {
          executionCondition: JSON.stringify({ condition: params.condition })
        })
      };

      console.log('Order data to save:', orderData);

      const savedOrder = await orderAPI.createOrder(orderData);
      console.log('Order saved successfully:', savedOrder);

      // Step 4: Update resolver metrics
      // await resolverAPI.getResolverMetrics(resolverAddress);

      return {
        success: true,
        intentId: result.intentId,
        txHash: result.txHash,
        order: savedOrder
      };

    } catch (error: any) {
      console.error('Error creating intent order:', error);
      
      // More specific error handling
      if (error.message?.includes('Database error')) {
        throw new Error(`Failed to save order to database: ${error.message}`);
      } else if (error.message?.includes('Failed to create order on blockchain')) {
        throw new Error(`Blockchain transaction failed: ${error.message}`);
      } else {
        throw new Error(`Order creation failed: ${error.message || 'Unknown error'}`);
      }
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