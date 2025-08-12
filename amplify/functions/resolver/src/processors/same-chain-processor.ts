import { OrderData, ProcessingResult, ChainType } from '../types';
import { OKXDexService, OKXConfig, CHAIN_IDS } from '../okx-dex-service';
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from '@mysten/sui/transactions';

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
      console.log(`Expected output: ${quote.toTokenAmount}`);

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

      // Execute the swap to resolver wallet first
      const resolverWalletAddress = this.okxService.getEvmWalletAddress();
      const swapResult = await this.okxService.executeEvmSwap({
        chainId,
        fromTokenAddress: order.sourceTokenAddress,
        toTokenAddress: order.destTokenAddress,
        amount: order.amountIn,
        userWalletAddress: resolverWalletAddress,
        slippage: '0.005'
      });

      console.log(`EVM swap completed, now transferring to user: ${order.recipientAddress}`);
      
      // Transfer swapped tokens to user
      const transferResult = await this.transferEvmTokensToUser(
        order.destTokenAddress,
        swapResult.details?.toToken.amount || quote.toToken.amount,
        order.recipientAddress,
        chainId
      );

      console.log(`EVM same-chain swap and transfer completed with tx: ${transferResult.txHash}`);

      return {
        success: true,
        txHash: transferResult.txHash,
        swapTxHash: swapResult.transactionHash,
        actualAmountOut: swapResult.details?.toToken.amount || quote.toToken.amount,
        explorerUrl: transferResult.explorerUrl
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

      console.log("quote:", quote)
      console.log("order: ", order)

      console.log(`SUI Quote received: ${quote.fromToken.tokenSymbol} -> ${quote.toToken.tokenSymbol}`);
      console.log(`Expected output: ${quote.toTokenAmount}`);


      const wallet = Ed25519Keypair.fromSecretKey(this.okxService.config.suiPrivateKey);
      const walletAddress = wallet.getPublicKey().toSuiAddress()

      // Execute the swap to resolver wallet first
      const swapResult = await this.okxService.executeSuiSwap({
        chainId,
        fromTokenAddress: order.sourceTokenAddress,
        toTokenAddress: order.destTokenAddress,
        amount: order.amountIn,
        userWalletAddress: walletAddress,
        slippage: '0.005'
      });

      console.log(`SUI swap completed, now transferring to user: ${order.recipientAddress}`);
      
      // Transfer swapped tokens to user
      const transferResult = await this.transferSuiTokensToUser(
        order.destTokenAddress,
        swapResult.details?.toToken.amount || quote.toToken.amount,
        order.recipientAddress
      );

      console.log(`SUI same-chain swap and transfer completed with tx: ${transferResult.txHash}`);

      return {
        success: true,
        txHash: transferResult.txHash,
        swapTxHash: swapResult.transactionId,
        actualAmountOut: swapResult.details?.toToken.amount || quote.toToken.amount,
        explorerUrl: transferResult.explorerUrl
      };
    } catch (error: any) {
      console.error('SUI swap error:', error);
      throw error;
    }
  }

  private async refundEvmOrder(order: OrderData): Promise<ProcessingResult> {
    console.log(`Refunding EVM order to ${order.senderAddress}`);

    try {
      const chainId = this.getOkxChainId(order.sourceChainId);
      
      const refundResult = await this.transferEvmTokensToUser(
        order.sourceTokenAddress,
        order.amountIn,
        order.senderAddress,
        chainId
      );

      console.log(`EVM refund completed with tx: ${refundResult.txHash}`);

      return {
        success: true,
        txHash: refundResult.txHash,
        actualAmountOut: order.amountIn,
        explorerUrl: refundResult.explorerUrl
      };
    } catch (error: any) {
      throw new Error(`EVM refund failed: ${error.message}`);
    }
  }

  private async refundSuiOrder(order: OrderData): Promise<ProcessingResult> {
    console.log(`Refunding SUI order to ${order.senderAddress}`);

    try {
      const refundResult = await this.transferSuiTokensToUser(
        order.sourceTokenAddress,
        order.amountIn,
        order.senderAddress
      );

      console.log(`SUI refund completed with tx: ${refundResult.txHash}`);

      return {
        success: true,
        txHash: refundResult.txHash,
        actualAmountOut: order.amountIn,
        explorerUrl: refundResult.explorerUrl
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

  private async transferEvmTokensToUser(
    tokenAddress: string,
    amount: string,
    recipientAddress: string,
    chainId: string
  ): Promise<{ txHash: string; explorerUrl: string }> {
    try {
      console.log(`Transferring ${amount} tokens to ${recipientAddress}`);
      
      const evmWallet = this.okxService.getEvmWallet();
      
      if (tokenAddress === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') {
        // Native ETH transfer
        const tx = await evmWallet.sendTransaction({
          to: recipientAddress,
          value: amount,
          gasLimit: 21000
        });
        
        const receipt = await tx.wait();
        return {
          txHash: receipt.hash,
          explorerUrl: this.getExplorerUrl(chainId, receipt.hash)
        };
      } else {
        // ERC20 token transfer
        const erc20Abi = [
          'function transfer(address to, uint256 amount) external returns (bool)'
        ];
        
        const contract = new (await import('ethers')).Contract(tokenAddress, erc20Abi, evmWallet);
        const tx = await contract.transfer(recipientAddress, amount);
        const receipt = await tx.wait();
        
        return {
          txHash: receipt.hash,
          explorerUrl: this.getExplorerUrl(chainId, receipt.hash)
        };
      }
    } catch (error: any) {
      console.error('EVM transfer failed:', error);
      throw error;
    }
  }

  private async transferSuiTokensToUser(
    tokenAddress: string,
    amount: string,
    recipientAddress: string
  ): Promise<{ txHash: string; explorerUrl: string }> {
    try {
      console.log(`Transferring ${amount} SUI tokens to ${recipientAddress}`);
      
      const wallet = Ed25519Keypair.fromSecretKey(this.okxService.config.suiPrivateKey);
      const client = this.okxService.getSuiClient();
      
      const tx = new Transaction();
      
      if (tokenAddress === '0x2::sui::SUI') {
        // Native SUI transfer
        const [coin] = tx.splitCoins(tx.gas, [amount]);
        tx.transferObjects([coin], recipientAddress);
      } else {
        // Custom token transfer
        const coins = await client.getCoins({
          owner: wallet.getPublicKey().toSuiAddress(),
          coinType: tokenAddress
        });
        
        if (coins.data.length === 0) {
          throw new Error(`No coins of type ${tokenAddress} found`);
        }
        
        const coinIds = coins.data.map((coin: any) => coin.coinObjectId);
        const [mergedCoin] = tx.mergeCoins(tx.object(coinIds[0]), coinIds.slice(1).map((id: any) => tx.object(id)));
        const [transferCoin] = tx.splitCoins(mergedCoin, [amount]);
        tx.transferObjects([transferCoin], recipientAddress);
      }
      
      tx.setGasBudget(15000000);
      
      const result = await client.signAndExecuteTransaction({
        transaction: tx,
        signer: wallet,
        options: {
          showEffects: true,
          showEvents: true
        }
      });
      
      if (result.effects?.status?.status !== 'success') {
        throw new Error(`SUI transfer failed: ${result.effects?.status?.error}`);
      }
      
      return {
        txHash: result.digest,
        explorerUrl: `https://suiscan.xyz/mainnet/tx/${result.digest}`
      };
    } catch (error: any) {
      console.error('SUI transfer failed:', error);
      throw error;
    }
  }

  private getExplorerUrl(chainId: string, txHash: string): string {
    const explorers: { [key: string]: string } = {
      '1': 'https://etherscan.io/tx',
      '8453': 'https://basescan.org/tx',
      '10': 'https://optimistic.etherscan.io/tx',
      '137': 'https://polygonscan.com/tx',
      '42161': 'https://arbiscan.io/tx'
    };
    
    return `${explorers[chainId] || 'https://etherscan.io/tx'}/${txHash}`;
  }

  private async simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
