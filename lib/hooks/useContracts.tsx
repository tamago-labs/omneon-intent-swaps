// React hooks for smart contract interactions
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { Address, parseUnits, formatUnits, getAddress } from 'viem';
import { useState, useEffect } from 'react';
import {
  CONTRACTS,
  INTENT_RFQ_ABI,
  ERC20_ABI,
  ChainType,
  getChainType,
  getChainId,
  formatTokenAmount,
  parseTokenAmount
} from '@/lib/contracts';

// Hook to get token balance
export function useTokenBalance(tokenAddress: Address, userAddress: Address | undefined) {
  return useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    enabled: !!userAddress && !!tokenAddress,
  } as any);
}

// Hook to get token allowance
export function useTokenAllowance(
  tokenAddress: Address,
  ownerAddress: Address | undefined,
  spenderAddress: Address
) {
  return useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: ownerAddress ? [ownerAddress, spenderAddress] : undefined,
    enabled: !!ownerAddress && !!tokenAddress,
  } as any);
}

// Hook to calculate fee
export function useFeeCalculation(amount: string, decimals: number) {
  const amountBigInt = parseTokenAmount(amount || '0', decimals);

  return useReadContract({
    address: CONTRACTS.SEPOLIA.IntentRFQ,
    abi: INTENT_RFQ_ABI,
    functionName: 'calculateFee',
    args: [amountBigInt],
    enabled: Number(amountBigInt) > 0,
  } as any);
}

// Hook to approve token
export function useTokenApproval() {
  const { writeContract, data: hash, isPending, isError, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const approve = async (tokenAddress: Address, amount: bigint) => {
    writeContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [CONTRACTS.SEPOLIA.IntentRFQ, amount],
    });
  };

  return {
    approve,
    isPending: isPending || isConfirming,
    isSuccess,
    isError,
    error,
    hash
  };
}

// Hook to create order on smart contract
export function useCreateOrder() {

  const { writeContract, data: hash, isPending, isError, error } = useWriteContract();
  const {
    isLoading: isConfirming,
    isSuccess,
    data: receipt
  } = useWaitForTransactionReceipt({ hash });
 

  const createOrder = async ({
    sourceChain,
    sourceToken,
    amountIn,
    destChain,
    destToken,
    minAmountOut,
    resolver
  }: {
    sourceChain: string;
    sourceToken: Address;
    amountIn: bigint;
    destChain: string;
    destToken: Address;
    minAmountOut: bigint;
    resolver: Address;
  }) => {

    const sourceChainType = getChainType(sourceChain);
    const sourceChainId = getChainId(sourceChain);
    const destChainType = getChainType(destChain);
    const destChainId = getChainId(destChain);

    console.log("resolver:", resolver)

    writeContract({
      address: CONTRACTS.SEPOLIA.IntentRFQ,
      abi: INTENT_RFQ_ABI,
      functionName: 'createOrder',
      args: [
        sourceChainType,
        BigInt(sourceChainId),
        sourceToken,
        amountIn,
        destChainType,
        BigInt(destChainId),
        destToken,
        minAmountOut,
        "0x91C65f404714Ac389b38335CccA4A876a8669d32"
      ],
    });

  };

  // Extract intent ID from receipt
  const getIntentIdFromReceipt = (receipt: any): string | null => {
    if (!receipt?.logs) return null;

    // Find OrderCreated event
    for (const log of receipt.logs) {
      if (log.address?.toLowerCase() === CONTRACTS.SEPOLIA.IntentRFQ.toLowerCase()) {
        // The first topic is the event signature, second is intentId
        if (log.topics && log.topics.length >= 2) {
          return log.topics[1]; // This is the intentId
        }
      }
    }
    return null;
  };

  return {
    createOrder,
    isPending: isPending || isConfirming,
    isSuccess,
    isError,
    error,
    hash,
    receipt,
    getIntentIdFromReceipt: () => getIntentIdFromReceipt(receipt)
  };
}

// Combined hook for complete order creation flow
export function useIntentOrderCreation() {
  const { address: userAddress } = useAccount();
  const [state, setState] = useState<'idle' | 'checking' | 'approving' | 'creating' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [intentId, setIntentId] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [pendingResolve, setPendingResolve] = useState<((value: any) => void) | null>(null);
  const [pendingApprovalResolve, setPendingApprovalResolve] = useState<((value: any) => void) | null>(null);

  const { approve, hash: approvalHash, isSuccess: approvalSuccess, isError: approvalError, error: approvalErrorDetails } = useTokenApproval();
  const {
    createOrder,
    hash: orderHash,
    isSuccess: orderSuccess,
    isError: orderError,
    error: orderErrorDetails,
    receipt,
    getIntentIdFromReceipt
  } = useCreateOrder();

  // Effect to handle approval success/failure
  useEffect(() => {
    if (approvalSuccess && pendingApprovalResolve) {
      console.log("Approval confirmed!");
      pendingApprovalResolve(true);
      setPendingApprovalResolve(null);
    } else if (approvalError && pendingApprovalResolve) {
      console.log("Approval failed:", approvalErrorDetails);
      setState('error');
      setError(approvalErrorDetails?.message || 'Approval failed');
      pendingApprovalResolve(null);
      setPendingApprovalResolve(null);
    }
  }, [approvalSuccess, approvalError, approvalErrorDetails, pendingApprovalResolve]);

  // Effect to handle order success/failure
  useEffect(() => {
    if (orderSuccess && receipt && pendingResolve) {
      console.log("Transaction confirmed!", receipt);
      
      // Extract intent ID from receipt
      const extractedIntentId = getIntentIdFromReceipt();
      if (extractedIntentId) {
        setIntentId(extractedIntentId);
        setTxHash(orderHash || null);
        setState('success');
        pendingResolve({ success: true, intentId: extractedIntentId, txHash: orderHash });
      } else {
        setState('error');
        setError('Failed to extract intent ID from transaction');
        pendingResolve({ success: false, error: 'Failed to extract intent ID from transaction' });
      }
      
      setPendingResolve(null);
    } else if (orderError && pendingResolve) {
      console.log("Transaction failed:", orderErrorDetails);
      setState('error');
      setError(orderErrorDetails?.message || 'Transaction failed');
      pendingResolve({ success: false, error: orderErrorDetails?.message || 'Transaction failed' });
      setPendingResolve(null);
    }
  }, [orderSuccess, orderError, orderErrorDetails, receipt, pendingResolve, getIntentIdFromReceipt, orderHash]);

  const submitOrder = async ({
    sourceChain,
    sourceToken,
    sourceTokenAddress,
    sourceTokenDecimals,
    amount,
    destChain,
    destToken,
    destTokenAddress,
    minAmountOut,
    resolver,
    needsApproval = false
  }: {
    sourceChain: string;
    sourceToken: string;
    sourceTokenAddress: Address;
    sourceTokenDecimals: number;
    amount: string;
    destChain: string;
    destToken: string;
    destTokenAddress: Address;
    minAmountOut: string;
    resolver: Address;
    needsApproval?: boolean;
  }) => {
    try {
      setState('checking');
      setError(null);

      const amountInBigInt = parseTokenAmount(amount, sourceTokenDecimals);
      const minAmountOutBigInt = parseTokenAmount(minAmountOut, sourceTokenDecimals); // Adjust decimals as needed

      if (needsApproval) {
        setState('approving');
        
        // Approve tokens
        approve(sourceTokenAddress, amountInBigInt);

        // Wait for approval to complete
        await new Promise((resolve, reject) => {
          setPendingApprovalResolve(() => resolve);
          
          // Set timeout for approval
          setTimeout(() => {
            if (pendingApprovalResolve) {
              setState('error');
              setError('Approval timed out');
              setPendingApprovalResolve(null);
              reject(new Error('Approval timed out'));
            }
          }, 60000); // 1 minute timeout for approval
        });
      }

      setState('creating');

      // Create the order
      createOrder({
        sourceChain,
        sourceToken: sourceTokenAddress,
        amountIn: amountInBigInt,
        destChain,
        destToken: destTokenAddress,
        minAmountOut: minAmountOutBigInt,
        resolver
      });

      // Return a promise that resolves when the transaction is confirmed
      return new Promise((resolve, reject) => {
        setPendingResolve(() => resolve);
        
        // Set a timeout to reject if transaction takes too long
        setTimeout(() => {
          if (pendingResolve) {
            setState('error');
            setError('Transaction timed out');
            setPendingResolve(null);
            reject(new Error('Transaction timed out'));
          }
        }, 120000); // 2 minutes timeout
      });

    } catch (err: any) {
      setError(err.message || 'Failed to create order');
      setState('error');
      return { success: false, error: err.message };
    }
  };

  const reset = () => {
    setState('idle');
    setError(null);
    setIntentId(null);
    setTxHash(null);
  };

  return {
    submitOrder,
    state,
    error,
    intentId,
    txHash,
    reset
  };
}

// Helper function to check if approval is needed
export function checkNeedsApproval(allowance: bigint | undefined, amount: bigint): boolean {
  if (!allowance) return true;
  return allowance < amount;
}

// Export helper functions
export { formatTokenAmount, parseTokenAmount };