// import { OrderData, DEFAULT_RESOLVER_CONFIG } from './types';
// import { OrderManager } from './order-manager';
// import { OrderValidator } from './order-validator';
// import { SameChainProcessor, CrossChainProcessor } from './processors/index';

// export class ResolverOrchestrator {
//   private orderManager: OrderManager;
//   private orderValidator: OrderValidator;
//   private sameChainProcessor: SameChainProcessor;
//   private crossChainProcessor: CrossChainProcessor;

//   constructor() {
//     this.orderManager = new OrderManager();
//     this.orderValidator = new OrderValidator();
//     this.sameChainProcessor = new SameChainProcessor();
//     this.crossChainProcessor = new CrossChainProcessor();
//   }

//   async processAllPendingOrders(): Promise<void> {
//     console.log('Starting resolver orchestration...');
    
//     try {
//       const pendingOrders = await this.orderManager.getAllPendingOrders();
//       console.log(`Found ${pendingOrders.length} pending orders`);

//       for (const order of pendingOrders) {
//         await this.processSingleOrder(order);
//       }

//       console.log('All pending orders processed successfully');
//     } catch (error) {
//       console.error('Error in resolver orchestration:', error);
//       throw error;
//     }
//   }

//   private async processSingleOrder(order: OrderData): Promise<void> {
//     console.log(`\n=== Processing Order ${order.id} ===`);
//     console.log(`Order details:`, {
//       intentId: order.intentId,
//       sourceChain: `${order.sourceChainType}:${order.sourceChainId}`,
//       destChain: `${order.destChainType}:${order.destChainId}`,
//       tokens: `${order.sourceTokenSymbol} -> ${order.destTokenSymbol}`,
//       amount: `${order.amountIn} -> min ${order.minAmountOut}`,
//       senderAddress: order.senderAddress,
//       recipientAddress: order.recipientAddress
//     });

//     try {
//       // Step 1: Check if order has expired
//       if (this.orderManager.isOrderExpired(order)) {
//         console.log(`Order ${order.id} has expired, initiating refund`);
//         await this.handleExpiredOrder(order);
//         return;
//       }

//       // Step 2: Validate order configuration
//       const validation = this.orderValidator.validateOrderForProcessing(order);
//       if (!validation.isValid) {
//         console.log(`Order ${order.id} validation failed: ${validation.reason}`);
        
//         if (validation.shouldRefund) {
//           await this.handleRefund(order, validation.reason || 'Invalid order configuration');
//         } else {
//           await this.handleFailure(order, validation.reason || 'Invalid order configuration');
//         }
//         return;
//       }

//       // Step 3: Determine order type and route to appropriate processor
//       const orderType = this.orderValidator.determineOrderType(order);
//       console.log(`Order type: ${orderType}`);

//       let result;
//       switch (orderType) {
//         case 'same-chain':
//           result = await this.sameChainProcessor.processOrder(order);
//           break;
        
//         case 'cross-chain-evm-to-sui':
//         case 'cross-chain-sui-to-evm':
//           result = await this.crossChainProcessor.processOrder(order);
//           break;
        
//         case 'unsupported':
//           console.log(`Unsupported order type for ${order.id}, initiating refund`);
//           await this.handleRefund(order, 'Unsupported cross-chain route');
//           return;
        
//         default:
//           throw new Error(`Unknown order type: ${orderType}`);
//       }

//       // Step 4: Handle processing result
//       if (result.success) {
//         await this.orderManager.markOrderAsCompleted(order.id, result);
//         console.log(`✅ Order ${order.id} completed successfully`);
//       } else {
//         await this.handleProcessingFailure(order, result.errorReason || 'Processing failed');
//       }

//     } catch (error: any) {
//       console.error(`❌ Error processing order ${order.id}:`, error);
//       await this.handleProcessingFailure(order, error.message);
//     }
//   }

//   private async handleExpiredOrder(order: OrderData): Promise<void> {
//     try {
//       // Attempt to refund expired order
//       let refundResult;
      
//       if (this.orderValidator.isSameChainOrder(order)) {
//         refundResult = await this.sameChainProcessor.refundOrder(order);
//       } else {
//         refundResult = await this.crossChainProcessor.refundOrder(order);
//       }

//       if (refundResult.success) {
//         await this.orderManager.markOrderAsExpired(order.id, 'Order expired - tokens refunded');
//         console.log(`💰 Expired order ${order.id} refunded successfully`);
//       } else {
//         await this.orderManager.markOrderAsFailed(
//           order.id, 
//           `Expired order refund failed: ${refundResult.errorReason}`, 
//           order.retryCount + 1
//         );
//         console.log(`❌ Failed to refund expired order ${order.id}`);
//       }
//     } catch (error: any) {
//       console.error(`Error handling expired order ${order.id}:`, error);
//       await this.orderManager.markOrderAsFailed(
//         order.id, 
//         `Expired order handling failed: ${error.message}`, 
//         order.retryCount + 1
//       );
//     }
//   }

//   private async handleRefund(order: OrderData, reason: string): Promise<void> {
//     try {
//       let refundResult;
      
//       if (this.orderValidator.isSameChainOrder(order)) {
//         refundResult = await this.sameChainProcessor.refundOrder(order);
//       } else {
//         refundResult = await this.crossChainProcessor.refundOrder(order);
//       }

//       if (refundResult.success) {
//         await this.orderManager.markOrderAsCompleted(order.id, {
//           ...refundResult,
//           actualAmountOut: order.amountIn // Full refund
//         });
//         console.log(`💰 Order ${order.id} refunded successfully: ${reason}`);
//       } else {
//         await this.handleFailure(order, `Refund failed: ${refundResult.errorReason}`);
//       }
//     } catch (error: any) {
//       console.error(`Error handling refund for order ${order.id}:`, error);
//       await this.handleFailure(order, `Refund error: ${error.message}`);
//     }
//   }

//   private async handleFailure(order: OrderData, reason: string): Promise<void> {
//     await this.orderManager.markOrderAsFailed(order.id, reason, order.retryCount + 1);
//     console.log(`❌ Order ${order.id} marked as failed: ${reason}`);
//   }

//   private async handleProcessingFailure(order: OrderData, reason: string): Promise<void> {
//     const newRetryCount = order.retryCount + 1;
    
//     if (newRetryCount >= DEFAULT_RESOLVER_CONFIG.maxRetries) {
//       // Max retries reached, try to refund
//       console.log(`Order ${order.id} failed after ${DEFAULT_RESOLVER_CONFIG.maxRetries} retries, attempting refund`);
//       await this.handleRefund(order, `Max retries exceeded: ${reason}`);
//     } else {
//       // Increment retry count and keep as pending
//       await this.orderManager.incrementRetryCount(order.id, reason, order.retryCount);
//       console.log(`⏳ Order ${order.id} retry ${newRetryCount}/${DEFAULT_RESOLVER_CONFIG.maxRetries}: ${reason}`);
//     }
//   }
// }
