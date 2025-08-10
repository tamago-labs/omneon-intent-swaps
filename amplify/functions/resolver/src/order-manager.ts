// import { OrderData, OrderStatus, ProcessingResult } from './types';
// import { generateClient } from 'aws-amplify/data';
// import type { Schema } from '../../../data/resource';

// export class OrderManager {
//   private client = generateClient<Schema>();

//   async getAllPendingOrders(): Promise<OrderData[]> {
//     try {
//       const response = await this.client.models.Order.list({
//         filter: {
//           status: { eq: OrderStatus.PENDING }
//         }
//       });

//       return response.data as OrderData[];
//     } catch (error) {
//       console.error('Error fetching pending orders:', error);
//       throw error;
//     }
//   }

//   async updateOrderStatus(
//     orderId: string, 
//     status: OrderStatus, 
//     additionalFields: Partial<OrderData> = {}
//   ): Promise<void> {
//     try {
//       await this.client.models.Order.update({
//         id: orderId,
//         status,
//         ...additionalFields
//       });
      
//       console.log(`Order ${orderId} status updated to ${status}`);
//     } catch (error) {
//       console.error(`Failed to update order ${orderId}:`, error);
//       throw error;
//     }
//   }

//   async markOrderAsExpired(orderId: string, errorReason?: string): Promise<void> {
//     await this.updateOrderStatus(orderId, OrderStatus.EXPIRED, {
//       errorReason: errorReason || 'Order expired',
//       completedAt: new Date().toISOString()
//     });
//   }

//   async markOrderAsCompleted(
//     orderId: string, 
//     result: ProcessingResult
//   ): Promise<void> {
//     await this.updateOrderStatus(orderId, OrderStatus.COMPLETED, {
//       actualAmountOut: result.actualAmountOut,
//       txHashDest: result.txHash,
//       completedAt: new Date().toISOString(),
//       executedAt: new Date().toISOString()
//     });
//   }

//   async markOrderAsFailed(
//     orderId: string, 
//     errorReason: string, 
//     retryCount: number
//   ): Promise<void> {
//     await this.updateOrderStatus(orderId, OrderStatus.FAILED, {
//       errorReason,
//       retryCount,
//       completedAt: new Date().toISOString()
//     });
//   }

//   async incrementRetryCount(
//     orderId: string, 
//     errorReason: string, 
//     currentRetryCount: number
//   ): Promise<void> {
//     await this.updateOrderStatus(orderId, OrderStatus.PENDING, {
//       errorReason,
//       retryCount: currentRetryCount + 1
//     });
//   }

//   isOrderExpired(order: OrderData): boolean {
//     if (!order.expiresAt) return false;
//     return new Date(order.expiresAt) < new Date();
//   }

//   calculateFeeAmount(amountIn: string, feeRate: number): bigint {
//     const amount = BigInt(amountIn);
//     return (amount * BigInt(feeRate)) / BigInt(10000);
//   }

//   calculateOutputAmount(amountIn: string, feeRate: number): bigint {
//     const amount = BigInt(amountIn);
//     const fee = this.calculateFeeAmount(amountIn, feeRate);
//     return amount - fee;
//   }

//   validateMinimumOutput(outputAmount: bigint, minAmountOut: string): boolean {
//     return outputAmount >= BigInt(minAmountOut);
//   }
// }
