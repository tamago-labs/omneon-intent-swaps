import type { EventBridgeHandler } from "aws-lambda";
import type { Schema } from '../../data/resource';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { env } from '$amplify/env/resolver-scheduler';
import { formatUnits } from 'viem';

// Initialize Amplify client
const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);
const client = generateClient<Schema>();
Amplify.configure(resourceConfig, libraryOptions);

export const handler: EventBridgeHandler<"Scheduled Event", null, void> = async (event) => {
  console.log("Resolver event triggered:", JSON.stringify(event, null, 2));

  try {
    // Get all pending orders
    const pendingOrders = await client.models.Order.list({
      filter: {
        status: { eq: 'PENDING' }
      }
    });

    console.log(`Found ${pendingOrders.data.length} pending orders`);

    for (const order of pendingOrders.data) {
      console.log(`Processing order: ${order.id}`);
      
      try {
        // Check if order has expired
        if (order.expiresAt && new Date(order.expiresAt) < new Date()) {
          console.log(`Order ${order.id} has expired, marking as EXPIRED`);
          await updateOrderStatus(order.id, 'EXPIRED');
          continue;
        }

        // Process order based on chain type
        if (order.sourceChainType === 0) { // EVM
          await processEvmOrder(order);
        } else if (order.sourceChainType === 1) { // SUI
          await processSuiOrder(order);
        } else {
          console.log(`Unsupported chain type: ${order.sourceChainType} for order ${order.id}`);
        }

      } catch (orderError: any) {
        console.error(`Error processing order ${order.id}:`, orderError);
        
        // Increment retry count
        const newRetryCount = (order.retryCount || 0) + 1;
        if (newRetryCount >= 3) {
          console.log(`Order ${order.id} failed after 3 retries, marking as FAILED`);
          await updateOrderStatus(order.id, 'FAILED', {
            retryCount: newRetryCount,
            errorReason: orderError.message
          });
        } else {
          await updateOrderStatus(order.id, 'PENDING', {
            retryCount: newRetryCount,
            errorReason: orderError.message
          });
        }
      }
    }

    console.log("Resolver processing completed successfully");

  } catch (error) {
    console.error("Resolver processing failed:", error);
    throw error;
  }
};

async function processEvmOrder(order: any) {
  console.log(`Processing EVM order ${order.id}`);
  
  // Calculate output amount (for now, just use a simple 1:1 ratio minus 0.3% fee)
  const inputAmount = BigInt(order.amountIn);
  const feeAmount = (inputAmount * BigInt(30)) / BigInt(10000); // 0.3% fee
  const outputAmount = inputAmount - feeAmount;

  // Validate minimum output amount
  if (outputAmount < BigInt(order.minAmountOut)) {
    throw new Error(`Output amount ${outputAmount} is less than minimum required ${order.minAmountOut}`);
  }

  console.log(`Processing transfer of ${formatUnits(outputAmount, order.destTokenDecimals)} ${order.destTokenSymbol} to ${order.userId}`);
  console.log(`Token address: ${order.destTokenAddress}`);

  try {
    // Simulate the transfer
    // In production, you would implement actual ERC20 transfer here:
    /*
    const hash = await evmClient.writeContract({
      address: order.destTokenAddress,
      abi: erc20Abi,
      functionName: 'transfer',
      args: [order.userId, outputAmount]
    });
    */

    // Simulate transaction hash for now
    const txHash = `0x${Math.random().toString(16).substring(2).padStart(64, '0')}`;
    
    await updateOrderStatus(order.id, 'COMPLETED', {
      actualAmountOut: outputAmount.toString(),
      txHashDest: txHash,
      completedAt: new Date().toISOString(),
      executedAt: new Date().toISOString()
    });

    console.log(`EVM order ${order.id} completed successfully with simulated tx: ${txHash}`);

  } catch (transferError) {
    console.error(`EVM transfer failed for order ${order.id}:`, transferError);
    throw transferError;
  }
}

async function processSuiOrder(order: any) {
  console.log(`Processing SUI order ${order.id}`);

  // Calculate output amount (simple 1:1 ratio minus 0.3% fee)
  const inputAmount = BigInt(order.amountIn);
  const feeAmount = (inputAmount * BigInt(30)) / BigInt(10000); // 0.3% fee
  const outputAmount = inputAmount - feeAmount;

  // Validate minimum output amount
  if (outputAmount < BigInt(order.minAmountOut)) {
    throw new Error(`Output amount ${outputAmount} is less than minimum required ${order.minAmountOut}`);
  }

  console.log(`Processing SUI transfer of ${formatAmount(outputAmount.toString(), order.destTokenDecimals)} ${order.destTokenSymbol} to ${order.userId}`);
  console.log(`Token type: ${order.destTokenAddress}`);

  try {
    // Simulate the SUI transfer
    // In production, you would implement actual SUI coin transfer here:
    /*
    // Get resolver address
    const resolverAddress = suiKeypair.getPublicKey().toSuiAddress();
    
    // Get coins owned by resolver
    const coins = await suiClient.getCoins({
      owner: resolverAddress,
      coinType: order.destTokenAddress
    });

    // Check balance and create transfer transaction
    const tx = new Transaction();
    // ... actual SUI transfer logic
    
    const result = await suiClient.signAndExecuteTransaction({
      transaction: tx,
      signer: suiKeypair
    });
    */

    // Simulate transaction hash for now
    const txHash = `0x${Math.random().toString(16).substring(2).padStart(64, '0')}`;

    // Update order status
    await updateOrderStatus(order.id, 'COMPLETED', {
      actualAmountOut: outputAmount.toString(),
      txHashDest: txHash,
      completedAt: new Date().toISOString(),
      executedAt: new Date().toISOString()
    });

    console.log(`SUI order ${order.id} completed successfully with simulated tx: ${txHash}`);

  } catch (error) {
    console.error(`SUI order processing failed for order ${order.id}:`, error);
    throw error;
  }
}

async function updateOrderStatus(orderId: string, status: string, additionalFields: any = {}) {
  try {
    await client.models.Order.update({
      id: orderId,
      status,
      updatedAt: new Date().toISOString(),
      ...additionalFields
    });
    console.log(`Order ${orderId} status updated to ${status}`);
  } catch (error) {
    console.error(`Failed to update order ${orderId}:`, error);
    throw error;
  }
}

// Helper function to format amounts for logging
function formatAmount(amount: string, decimals: number): string {
  return formatUnits(BigInt(amount), decimals);
}
