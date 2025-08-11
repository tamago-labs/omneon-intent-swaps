// src/api/swap/sui/sui-swap.ts
// import { SuiWallet } from "@okxweb3/coin-sui";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from '@mysten/sui/transactions';

export class SuiSwapExecutor {
    private readonly client: SuiClient;
    private readonly wallet: Ed25519Keypair;
    private readonly walletAddress: string;
    private readonly DEFAULT_GAS_BUDGET = 50000000;

    constructor(
        private readonly config: any,
        private readonly networkConfig: any
    ) {
        if (!this.config.sui) {
            throw new Error("Sui configuration required");
        }

        if (!this.config.sui.privateKey) {
            throw new Error("Sui private key required");
        }

        // Initialize SUI client
        this.client = new SuiClient({
            url: getFullnodeUrl('mainnet')
        });

        // Initialize wallet 
        this.wallet = Ed25519Keypair.fromSecretKey(this.config.sui.privateKey);
        this.walletAddress = this.wallet.getPublicKey().toSuiAddress();

        console.log(`SUI wallet initialized: ${this.walletAddress}`);
    }

    async executeSwap(swapData: any, params: any): Promise<any> {
        const quoteData = swapData.data?.[0];
        if (!quoteData?.routerResult) {
            throw new Error("Invalid swap data: missing router result");
        }

        const { routerResult } = quoteData;
        const txData = quoteData.tx?.data;
        if (!txData) {
            throw new Error("Missing transaction data");
        }

        try {
            const result = await this.executeSuiTransaction(txData);
            return this.formatSwapResult(result.txId, routerResult);
        } catch (error) {
            console.error("Swap execution failed:", error);
            throw error;
        }
    }

    private async executeSuiTransaction(txData: string) {
        let retryCount = 0;
        while (retryCount < (this.networkConfig.maxRetries || 3)) {
            try {

                // Create transaction block
                const txBlock = Transaction.from(txData);
                txBlock.setSender(this.config.sui.walletAddress);

                // Get current gas price and set gas parameters
                // const referenceGasPrice = await this.client.getReferenceGasPrice();
                // txBlock.setGasPrice(BigInt(referenceGasPrice));
                // txBlock.setGasBudget(BigInt(this.DEFAULT_GAS_BUDGET));

                // Sign and execute transaction directly
                // const result = await this.client.signAndExecuteTransaction({
                //     signer: this.wallet,
                //     transaction: txBlock,
                //     options: {
                //         showEffects: true,
                //         showEvents: true,
                //         showInput: true,
                //         showRawInput: true,
                //         showObjectChanges: true,
                //     }
                // });

                // if (!result.digest) {
                //     throw new Error('Transaction failed: No digest received');
                // }

                // // Wait for confirmation with timeout
                // const confirmation = await this.client.waitForTransaction({
                //     digest: result.digest,
                //     options: {
                //         showEffects: true,
                //         showEvents: true,
                //         showObjectChanges: true,
                //     }
                // });

                // const status = confirmation.effects?.status?.status;
                // if (status !== 'success') {
                //     const error = confirmation.effects?.status?.error;
                //     throw new Error(`Transaction failed with status: ${status}${error ? `, error: ${error}` : ''}`);
                // }

                // Set gas parameters
                // const referenceGasPrice = await this.client.getReferenceGasPrice();
                // txBlock.setGasPrice(BigInt(referenceGasPrice));
                // txBlock.setGasBudget(BigInt(this.DEFAULT_GAS_BUDGET));
                txBlock.setGasBudget(10000000)

                // Build the transaction
                const builtTx = await txBlock.build({ client: this.client });
                // const txBytes = Buffer.from(builtTx).toString('base64');

                // Sign transaction
                // const signedTx = await this.wallet.signTransaction({
                //     privateKey: this.config.sui.privateKey,
                //     data: {
                //         type: 'raw',
                //         data: txBytes
                //     }
                // });

                const signedTx = await this.wallet.signTransaction(builtTx)

                console.log("signedTx : ", signedTx)

                if (!signedTx?.signature) {
                    throw new Error("Failed to sign transaction");
                }

                // Execute transaction
                const result = await this.client.executeTransactionBlock({
                    transactionBlock: builtTx,
                    signature: [signedTx.signature],
                    options: {
                        showEffects: true,
                        showEvents: true,
                    }
                });

                console.log("result:", result)

                if (!result.digest) {
                    throw new Error('Transaction failed: No digest received');
                }

                // Wait for confirmation
                const confirmation = await this.client.waitForTransaction({
                    digest: result.digest,
                    options: {
                        showEffects: true,
                        showEvents: true,
                    }
                });

                const status = confirmation.effects?.status?.status;
                if (status !== 'success') {
                    throw new Error(`Transaction failed with status: ${status}`);
                }

                return {
                    txId: result.digest,
                    confirmation,
                    effects: confirmation.effects,
                    events: confirmation.events,
                    objectChanges: confirmation.objectChanges
                };

                // console.log(`SUI swap successful: ${result.digest}`);

                // return {
                //     txId: result.digest,
                //     confirmation,
                //     effects: confirmation.effects,
                //     events: confirmation.events,
                //     objectChanges: confirmation.objectChanges
                // };

            } catch (error: any) {
                retryCount++;
                console.error(`Transaction attempt ${retryCount} failed:`, error.message);
                
                if (retryCount >= (this.networkConfig.maxRetries || 3)) {
                    throw error;
                }
                
                // Exponential backoff
                const delay = 2000 * Math.pow(2, retryCount - 1);
                console.log(`Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }

        throw new Error('Max retries exceeded');
    }

    private formatSwapResult(txId: string, routerResult: any): any {
        const fromDecimals = parseInt(routerResult.fromToken.decimal);
        const toDecimals = parseInt(routerResult.toToken.decimal);

        const displayFromAmount = (
            Number(routerResult.fromTokenAmount) /
            Math.pow(10, fromDecimals)
        ).toFixed(6);

        const displayToAmount = (
            Number(routerResult.toTokenAmount) /
            Math.pow(10, toDecimals)
        ).toFixed(6);

        return {
            success: true,
            transactionId: txId,
            explorerUrl: `https://suiscan.xyz/mainnet/tx/${txId}`,
            details: {
                fromToken: {
                    symbol: routerResult.fromToken.tokenSymbol,
                    amount: displayFromAmount,
                    decimal: routerResult.fromToken.decimal,
                },
                toToken: {
                    symbol: routerResult.toToken.tokenSymbol,
                    amount: displayToAmount,
                    decimal: routerResult.toToken.decimal,
                },
                priceImpact: routerResult.priceImpactPercentage,
            },
            walletAddress: this.walletAddress,
            gasUsed: this.DEFAULT_GAS_BUDGET, // You could get actual gas used from effects
        };
    }

    // Utility methods
    async getBalance(coinType?: string): Promise<string> {
        try {
            const balance = await this.client.getBalance({
                owner: this.walletAddress,
                coinType: coinType || '0x2::sui::SUI'
            });
            return balance.totalBalance;
        } catch (error) {
            console.error('Error getting balance:', error);
            return '0';
        }
    }

    async getAllBalances(): Promise<any[]> {
        try {
            const balances = await this.client.getAllBalances({
                owner: this.walletAddress
            });
            return balances;
        } catch (error) {
            console.error('Error getting all balances:', error);
            return [];
        }
    }

    async getCoins(coinType?: string, limit: number = 10): Promise<any> {
        try {
            const coins = await this.client.getCoins({
                owner: this.walletAddress,
                coinType: coinType || '0x2::sui::SUI',
                limit
            });
            return coins;
        } catch (error) {
            console.error('Error getting coins:', error);
            return { data: [], hasNextPage: false };
        }
    }

    getWalletAddress(): string {
        return this.walletAddress;
    }

    // For debugging/testing
    async getTransactionBlock(digest: string): Promise<any> {
        try {
            return await this.client.getTransactionBlock({
                digest,
                options: {
                    showEffects: true,
                    showEvents: true,
                    showInput: true,
                    showObjectChanges: true,
                }
            });
        } catch (error) {
            console.error('Error getting transaction block:', error);
            throw error;
        }
    }
}