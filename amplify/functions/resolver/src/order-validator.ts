// import { OrderData, ChainType, CROSS_CHAIN_ROUTES } from './types';

// export class OrderValidator {
  
//   isSameChainOrder(order: OrderData): boolean {
//     return order.sourceChainType === order.destChainType && 
//            order.sourceChainId === order.destChainId;
//   }

//   isCrossChainOrder(order: OrderData): boolean {
//     return !this.isSameChainOrder(order);
//   }

//   isSupportedCrossChainRoute(order: OrderData): boolean {
//     return CROSS_CHAIN_ROUTES.some(route => 
//       route.source.chainType === order.sourceChainType &&
//       route.source.chainId === order.sourceChainId &&
//       route.dest.chainType === order.destChainType &&
//       route.dest.chainId === order.destChainId
//     );
//   }

//   isEvmToSuiRoute(order: OrderData): boolean {
//     return order.sourceChainType === ChainType.EVM && 
//            order.destChainType === ChainType.SUI;
//   }

//   isSuiToEvmRoute(order: OrderData): boolean {
//     return order.sourceChainType === ChainType.SUI && 
//            order.destChainType === ChainType.EVM;
//   }

//   validateOrderForProcessing(order: OrderData): {
//     isValid: boolean;
//     reason?: string;
//     shouldRefund: boolean;
//   } {
//     // Check if same-chain swap
//     if (this.isSameChainOrder(order)) {
//       return {
//         isValid: true,
//         shouldRefund: false
//       };
//     }

//     // Check if supported cross-chain route
//     if (this.isCrossChainOrder(order)) {
//       if (this.isSupportedCrossChainRoute(order)) {
//         return {
//           isValid: true,
//           shouldRefund: false
//         };
//       } else {
//         return {
//           isValid: false,
//           reason: 'Unsupported cross-chain route',
//           shouldRefund: true
//         };
//       }
//     }

//     return {
//       isValid: false,
//       reason: 'Invalid order configuration',
//       shouldRefund: true
//     };
//   }

//   determineOrderType(order: OrderData): 'same-chain' | 'cross-chain-evm-to-sui' | 'cross-chain-sui-to-evm' | 'unsupported' {
//     if (this.isSameChainOrder(order)) {
//       return 'same-chain';
//     }

//     if (this.isEvmToSuiRoute(order)) {
//       return 'cross-chain-evm-to-sui';
//     }

//     if (this.isSuiToEvmRoute(order)) {
//       return 'cross-chain-sui-to-evm';
//     }

//     return 'unsupported';
//   }
// }
