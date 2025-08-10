import { OrderData, ProcessingResult, ChainType } from '../types';
import { OKXDexService, OKXConfig, CHAIN_IDS, TOKEN_ADDRESSES } from '../okx-dex-service';

export abstract class BaseChainProcessor {
  abstract processOrder(order: OrderData): Promise<ProcessingResult>;
  abstract refundOrder(order: OrderData): Promise<ProcessingResult>;
  
  protected calculateOutputAmount(amountIn: string, feeRate: number = 30): bigint {
    const amount = BigInt(amountIn);
    const fee = (amount * BigInt(feeRate)) / BigInt(10000);
    return amount - fee;
  }

  protected validateMinimumOutput(outputAmount: bigint, minAmountOut: string): boolean {
    return outputAmount >= BigInt(minAmountOut);
  }

  protected generateMockTxHash(): string {
    return `0x${Math.random().toString(16).substring(2).padStart(64, '0')}`;
  }
}

export class SameChainProcessor extends BaseChainProcessor {
  private okxService: any;

  constructor() {
    super();
    
    // Initialize OKX DEX service with environment variables
    const config: OKXConfig = {
      apiKey: process.env.OKX_API_KEY!,
      secretKey: process.env.OKX_SECRET_KEY!,
      apiPassphrase: process.env.OKX_API_PASSPHRASE!,
      projectId: process.env.OKX_PROJECT_ID!,
      evmPrivateKey: process.env.EVM_RESOLVER_PRIVATE_KEY!,
      suiPrivateKey: process.env.SUI_RESOLVER_PRIVATE_KEY
    };
    
    this.okxService = new OKXDexService(config);
  }
  
  async processOrder(order: OrderData): Promise<ProcessingResult> {
    console.log(`Processing same-chain order ${order.id}`);
    
    try {
      // Route to appropriate chain processor
      if (order.sourceChainType === ChainType.EVM) {
        return await this.processEvmSameChainSwap(order);
      } else if (order.sourceChainType === ChainType.SUI) {
        return await this.processSuiSameChainSwap(order);
      } else {
        throw new Error(`Unsupported chain type for same-chain swap: ${order.sourceChainType}`);
      }
    } catch (error: any) {
      console.error(`Same-chain processing failed for order ${order.id}:`, error);
      return {
        success: false,
        errorReason: error.message
      };
    }
  }

  async refundOrder(order: OrderData): Promise<ProcessingResult> {
    console.log(`Refunding same-chain order ${order.id}`);
    
    try {
      if (order.sourceChainType === ChainType.EVM) {
        return await this.refundEvmOrder(order);
      } else if (order.sourceChainType === ChainType.SUI) {
        return await this.refundSuiOrder(order);
      } else {
        throw new Error(`Unsupported chain type for refund: ${order.sourceChainType}`);
      }
    } catch (error: any) {
      return {
        success: false,
        errorReason: error.message
      };
    }
  }

  private async processEvmSameChainSwap(order: OrderData): Promise<any> {
    console.log(`Processing EVM same-chain swap for ${order.sourceTokenSymbol} -> ${order.destTokenSymbol}`);
    
    try {
      // Map chain ID to OKX chain ID format
      const chainId = this.getOkxChainId(order.sourceChainId);
      
      // First get a quote to validate the swap and check rates
      const quote = await this.okxService.getQuote({
        chainId,
        fromTokenAddress: order.sourceTokenAddress,
        toTokenAddress: order.destTokenAddress,
        amount: order.amountIn,
        slippage: '0.005' // 0.5% slippage
      });

      console.log(`Quote received: ${quote.fromToken.tokenSymbol} -> ${quote.toToken.tokenSymbol}`);
      console.log(`Expected output: ${quote.toToken.amount}`);

      // Validate minimum output requirement
      const expectedOutput = BigInt(quote.toToken.amount);
      if (!this.validateMinimumOutput(expectedOutput, order.minAmountOut)) {
        throw new Error(`Output amount ${expectedOutput} is less than minimum required ${order.minAmountOut}`);
      }

      // Check if token approval is needed (skip for native tokens)
      if (order.sourceTokenAddress !== '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') {
        console.log('Checking token approval for infinity allowance...');
        const approvalCheck = await this.okxService.checkApproval({
          chainId,
          tokenAddress: order.sourceTokenAddress,
          amount: order.amountIn
        });

        console.log('Approval check result:', {
          needsApproval: approvalCheck.needsApproval,
          currentAllowance: approvalCheck.currentAllowance
        });

        if (approvalCheck.needsApproval) {
          console.log('Token approval required, executing INFINITY approval...');
          const approvalResult = await this.okxService.executeApproval({
            chainId,
            tokenAddress: order.sourceTokenAddress,
            amount: order.amountIn // Amount doesn't matter, we approve MAX_UINT256
          });
          console.log(`Infinity approval completed: ${approvalResult.transactionHash}`);
          
          if (approvalResult.explorerUrl) {
            console.log(`Approval explorer URL: ${approvalResult.explorerUrl}`);
          }
        } else {
          console.log('Token already has sufficient approval (infinity or sufficient amount)');
        }
      }

      // Execute the swap
      const swapResult = await this.okxService.executeEvmSwap({
        chainId,
        fromTokenAddress: order.sourceTokenAddress,
        toTokenAddress: order.destTokenAddress,
        amount: order.amountIn,
        userWalletAddress: order.recipientAddress,
        slippage: '0.005'
      });

      console.log(`EVM same-chain swap completed with tx: ${swapResult.transactionHash}`);
      
      return {
        success: true,
        txHash: swapResult.transactionHash!,
        actualAmountOut: swapResult.details?.toToken.amount || quote.toToken.amount,
        explorerUrl: swapResult.explorerUrl
      };
    } catch (error: any) {
      console.error('EVM swap error:', error);
      throw error;
    }
  }

  private async processSuiSameChainSwap(order: OrderData): Promise<any> {
    console.log(`Processing SUI same-chain swap for ${order.sourceTokenSymbol} -> ${order.destTokenSymbol}`);
    
    try {
      const chainId = CHAIN_IDS.SUI_MAINNET;
      
      // Get quote first
      const quote = await this.okxService.getQuote({
        chainId,
        fromTokenAddress: order.sourceTokenAddress,
        toTokenAddress: order.destTokenAddress,
        amount: order.amountIn,
        slippage: '0.005'
      });

      console.log(`SUI Quote received: ${quote.fromToken.tokenSymbol} -> ${quote.toToken.tokenSymbol}`);
      console.log(`Expected output: ${quote.toToken.amount}`);

      // Validate minimum output
      const expectedOutput = BigInt(quote.toToken.amount);
      if (!this.validateMinimumOutput(expectedOutput, order.minAmountOut)) {
        throw new Error(`Output amount ${expectedOutput} is less than minimum required ${order.minAmountOut}`);
      }

      // Execute the swap
      const swapResult = await this.okxService.executeSuiSwap({
        chainId,
        fromTokenAddress: order.sourceTokenAddress,
        toTokenAddress: order.destTokenAddress,
        amount: order.amountIn,
        userWalletAddress: order.recipientAddress,
        slippage: '0.005'
      });

      console.log(`SUI same-chain swap completed with tx: ${swapResult.transactionId}`);
      
      return {
        success: true,
        txHash: swapResult.transactionId!,
        actualAmountOut: swapResult.details?.toToken.amount || quote.toToken.amount,
        explorerUrl: swapResult.explorerUrl
      };
    } catch (error: any) {
      console.error('SUI swap error:', error);
      throw error;
    }
  }

  private async refundEvmOrder(order: OrderData): Promise<ProcessingResult> {
    console.log(`Refunding EVM order to ${order.senderAddress}`);
    
    try {
      // TODO: Implement actual EVM refund transaction
      // For now, simulate refund
      await this.simulateDelay(1000);
      const txHash = this.generateMockTxHash();
      
      console.log(`EVM refund completed with tx: ${txHash}`);
      
      return {
        success: true,
        txHash,
        actualAmountOut: order.amountIn // Full refund
      };
    } catch (error: any) {
      throw new Error(`EVM refund failed: ${error.message}`);
    }
  }

  private async refundSuiOrder(order: OrderData): Promise<ProcessingResult> {
    console.log(`Refunding SUI order to ${order.senderAddress}`);
    
    try {
      // TODO: Implement actual SUI refund transaction
      // For now, simulate refund
      await this.simulateDelay(1000);
      const txHash = this.generateMockTxHash();
      
      console.log(`SUI refund completed with tx: ${txHash}`);
      
      return {
        success: true,
        txHash,
        actualAmountOut: order.amountIn // Full refund
      };
    } catch (error: any) {
      throw new Error(`SUI refund failed: ${error.message}`);
    }
  }

  private getOkxChainId(chainId: number): string {
    switch (chainId) {
      case 1: return CHAIN_IDS.ETHEREUM;
      case 8453: return CHAIN_IDS.BASE;
      case 10: return CHAIN_IDS.OPTIMISM;
      case 137: return CHAIN_IDS.POLYGON;
      case 42161: return CHAIN_IDS.ARBITRUM;
      default: throw new Error(`Unsupported chain ID: ${chainId}`);
    }
  }

  private async simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
