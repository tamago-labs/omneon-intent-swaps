import { ethers } from 'ethers';
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";

export interface OKXConfig {
    apiKey: string;
    secretKey: string;
    apiPassphrase: string;
    projectId: string;
    evmPrivateKey: string;
    suiPrivateKey?: string;
}

export interface QuoteResult {
    fromToken: {
        tokenSymbol: string;
        amount: string;
        decimal: string;
        tokenUnitPrice: string;
    };
    toToken: {
        tokenSymbol: string;
        amount: string;
        decimal: string;
        tokenUnitPrice: string;
    };
    priceImpact: string;
    estimateGasFee: string;
    routerResult: Array<{
        dexName: string;
        tradeFee: string;
    }>;
}

export interface SwapResult {
    transactionHash?: string;
    transactionId?: string;
    blockNumber?: number;
    gasUsed?: string;
    status?: number;
    explorerUrl?: string;
    details?: {
        fromToken: {
            amount: string;
            symbol: string;
        };
        toToken: {
            amount: string;
            symbol: string;
        };
        priceImpact?: string;
    };
}

export class OKXDexService {
    private evmClient: any;
    private suiClient: any;
    private config: OKXConfig;
    private isInitialized = false;

    constructor(config: OKXConfig) {
        this.config = config;
    }

    // Lazy initialization with dynamic imports
    private async initializeClients(): Promise<void> {
        if (this.isInitialized) return;

        try {
            // Dynamic import of OKX DEX SDK
            const { OKXDexClient } = await import('@okx-dex/okx-dex-sdk');
            
            // Dynamic import of EVM wallet utility
            const { createEVMWallet } = await import('./evm-wallet');

            // Initialize EVM client
            const evmProvider = new ethers.JsonRpcProvider(this.getRpcUrl('evm'));
            const evmWallet = createEVMWallet(this.config.evmPrivateKey, evmProvider);

            this.evmClient = new OKXDexClient({
                apiKey: this.config.apiKey,
                secretKey: this.config.secretKey,
                apiPassphrase: this.config.apiPassphrase,
                projectId: this.config.projectId,
                evm: {
                    wallet: evmWallet
                }
            });

            // Initialize SUI client if private key is provided
            if (this.config.suiPrivateKey) {
                const wallet = Ed25519Keypair.fromSecretKey(this.config.suiPrivateKey);

                this.suiClient = new OKXDexClient({
                    apiKey: this.config.apiKey,
                    secretKey: this.config.secretKey,
                    apiPassphrase: this.config.apiPassphrase,
                    projectId: this.config.projectId,
                    sui: {
                        privateKey: this.config.suiPrivateKey,
                        walletAddress: wallet.getPublicKey().toSuiAddress(),
                        connection: {
                            rpcUrl: 'https://fullnode.mainnet.sui.io'
                        }
                    }
                });
            }

            this.isInitialized = true;
            console.log('OKX DEX clients initialized successfully');
        } catch (error) {
            console.error('Failed to initialize OKX DEX clients:', error);
            throw new Error(`Initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    // Alternative: Create clients on-demand with dynamic imports
    private async createEvmClient(chainId?: string): Promise<any> {
        try {
            const { OKXDexClient } = await import('@okx-dex/okx-dex-sdk');
            const { createEVMWallet } = await import('./evm-wallet');

            const rpcUrl = this.getRpcUrl('evm', chainId);
            const evmProvider = new ethers.JsonRpcProvider(rpcUrl);
            const evmWallet = createEVMWallet(this.config.evmPrivateKey, evmProvider);

            return new OKXDexClient({
                apiKey: this.config.apiKey,
                secretKey: this.config.secretKey,
                apiPassphrase: this.config.apiPassphrase,
                projectId: this.config.projectId,
                evm: {
                    wallet: evmWallet
                }
            });
        } catch (error) {
            console.error('Failed to create EVM client:', error);
            throw new Error(`EVM client creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private async createSuiClient(): Promise<any> {
        if (!this.config.suiPrivateKey) {
            throw new Error('SUI private key not provided');
        }

        try {
            const { OKXDexClient } = await import('@okx-dex/okx-dex-sdk');
            
            const wallet = Ed25519Keypair.fromSecretKey(this.config.suiPrivateKey);

            return new OKXDexClient({
                apiKey: this.config.apiKey,
                secretKey: this.config.secretKey,
                apiPassphrase: this.config.apiPassphrase,
                projectId: this.config.projectId,
                sui: {
                    privateKey: this.config.suiPrivateKey,
                    walletAddress: wallet.getPublicKey().toSuiAddress(),
                    connection: {
                        rpcUrl: 'https://fullnode.mainnet.sui.io'
                    }
                }
            });
        } catch (error) {
            console.error('Failed to create SUI client:', error);
            throw new Error(`SUI client creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private getRpcUrl(chainType: 'evm' | 'sui', chainId?: string): string {
        if (chainType === 'sui') {
            return 'https://fullnode.mainnet.sui.io';
        }

        // Dynamic EVM RPC URLs based on chain
        const baseUrl = 'https://eth-mainnet.g.alchemy.com/v2/46BFnBkjDdWActWG5HvRV';
        
        switch (chainId) {
            case '8453': // Base
                return 'https://base-mainnet.g.alchemy.com/v2/46BFnBkjDdWActWG5HvRV';
            case '10': // Optimism
                return 'https://opt-mainnet.g.alchemy.com/v2/46BFnBkjDdWActWG5HvRV';
            case '1': // Ethereum
            default:
                return baseUrl;
        }
    }

    async getQuote(params: {
        chainId: string;
        fromTokenAddress: string;
        toTokenAddress: string;
        amount: string;
        slippage?: string;
    }): Promise<QuoteResult> {
        try {
            console.log(`Getting quote for chain ${params.chainId}: ${params.fromTokenAddress} -> ${params.toTokenAddress}`);

            // Use on-demand client creation instead of pre-initialized clients
            const client = params.chainId === '784' 
                ? await this.createSuiClient() 
                : await this.createEvmClient(params.chainId);

            const quote = await client.dex.getQuote({
                chainId: params.chainId,
                fromTokenAddress: params.fromTokenAddress,
                toTokenAddress: params.toTokenAddress,
                amount: params.amount,
                slippage: params.slippage || '0.005'
            });

            if (!quote.data || quote.data.length === 0) {
                throw new Error('No quote data available');
            }

            return quote.data[0];
        } catch (error: any) {
            console.error('Error getting quote:', error.message);
            throw new Error(`Failed to get quote: ${error.message}`);
        }
    }

    async executeEvmSwap(params: {
        chainId: string;
        fromTokenAddress: string;
        toTokenAddress: string;
        amount: string;
        userWalletAddress: string;
        slippage?: string;
    }): Promise<SwapResult> {
        try {
            console.log(`Executing EVM swap on chain ${params.chainId}`);

            // Create client on-demand with dynamic imports
            const client = await this.createEvmClient(params.chainId);

            const swapResult = await client.dex.executeSwap({
                chainId: params.chainId,
                fromTokenAddress: params.fromTokenAddress,
                toTokenAddress: params.toTokenAddress,
                amount: params.amount,
                slippage: params.slippage || '0.005',
                userWalletAddress: params.userWalletAddress
            });

            console.log('EVM swap completed:', swapResult.transactionId);

            return {
                transactionHash: swapResult.transactionId,
                explorerUrl: swapResult.explorerUrl,
                details: swapResult.details
            };
        } catch (error: any) {
            console.error('Error executing EVM swap:', error);
            throw new Error(`EVM swap failed: ${error.message}`);
        }
    }

    async executeSuiSwap(params: {
        chainId: string;
        fromTokenAddress: string;
        toTokenAddress: string;
        amount: string;
        userWalletAddress: string;
        slippage?: string;
    }): Promise<SwapResult> {
        try {
            console.log(`Executing SUI swap`);

            // Create SUI client on-demand
            const suiClient = await this.createSuiClient();

            const swapResult = await suiClient.dex.executeSwap({
                chainId: params.chainId,
                fromTokenAddress: params.fromTokenAddress,
                toTokenAddress: params.toTokenAddress,
                amount: params.amount,
                slippage: params.slippage || '0.005',
                userWalletAddress: params.userWalletAddress
            });

            console.log('SUI swap completed:', swapResult.transactionId);

            return {
                transactionId: swapResult.transactionId,
                explorerUrl: swapResult.explorerUrl,
                details: swapResult.details
            };
        } catch (error: any) {
            console.error('Error executing SUI swap:', error);
            throw new Error(`SUI swap failed: ${error.message}`);
        }
    }

    // Constants for infinity approval
    private readonly MAX_UINT256 = '115792089237316195423570985008687907853269984665640564039457584007913129639935';

    async checkApproval(params: {
        chainId: string;
        tokenAddress: string;
        amount: string;
    }): Promise<{ needsApproval: boolean; allowance: string; currentAllowance?: string }> {
        try {
            if (params.tokenAddress === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') {
                return { needsApproval: false, allowance: 'unlimited' };
            }

            // Create client on-demand
            const client = await this.createEvmClient(params.chainId);

            // Check current allowance first
            try {
                const allowanceResult = await client.dex.executeApproval({
                    chainId: params.chainId,
                    tokenContractAddress: params.tokenAddress,
                    approveAmount: params.amount
                });

                if ('alreadyApproved' in allowanceResult) {
                    return { needsApproval: false, allowance: 'sufficient', currentAllowance: 'approved' };
                } else {
                    return { needsApproval: true, allowance: '0', currentAllowance: '0' };
                }
            } catch (error: any) {
                console.log('Could not check current allowance, assuming approval needed');
                return { needsApproval: true, allowance: '0', currentAllowance: 'unknown' };
            }
        } catch (error: any) {
            console.error('Error checking approval:', error);
            return { needsApproval: true, allowance: '0' };
        }
    }

    async executeApproval(params: {
        chainId: string;
        tokenAddress: string;
        amount: string;
    }): Promise<SwapResult> {
        try {
            console.log(`Executing INFINITY approval for token ${params.tokenAddress}`);
            console.log(`Using max uint256: ${this.MAX_UINT256}`);

            // Create client on-demand
            const client = await this.createEvmClient(params.chainId);

            const result = await client.dex.executeApproval({
                chainId: params.chainId,
                tokenContractAddress: params.tokenAddress,
                approveAmount: this.MAX_UINT256
            });

            if ('alreadyApproved' in result) {
                console.log('Token already has sufficient approval');
                return {
                    transactionHash: 'already_approved',
                    status: 1
                };
            } else {
                console.log('Infinity token approval completed:', result.transactionHash);
                return {
                    transactionHash: result.transactionHash,
                    explorerUrl: result.explorerUrl
                };
            }
        } catch (error: any) {
            console.error('Error executing infinity approval:', error);
            throw new Error(`Token infinity approval failed: ${error.message}`);
        }
    }

    toBaseUnits(amount: string, decimals: number): string {
        const [integerPart, decimalPart = ''] = amount.split('.');
        const currentDecimals = decimalPart.length;

        let result = integerPart + decimalPart;

        if (currentDecimals < decimals) {
            result = result + '0'.repeat(decimals - currentDecimals);
        } else if (currentDecimals > decimals) {
            result = result.slice(0, result.length - (currentDecimals - decimals));
        }

        result = result.replace(/^0+/, '') || '0';
        return result;
    }

    fromBaseUnits(amount: string, decimals: number): string {
        const divisor = Math.pow(10, decimals);
        const value = parseFloat(amount) / divisor;
        return value.toFixed(6);
    }

    getMaxUint256(): string {
        return this.MAX_UINT256;
    }

    isInfinityApproval(amount: string): boolean {
        const threshold = BigInt(this.MAX_UINT256) / BigInt(2);
        try {
            return BigInt(amount) >= threshold;
        } catch {
            return false;
        }
    }

    // Optional: Utility method to check if dependencies are available
    async checkDependencies(): Promise<{ okxSdk: boolean; evmWallet: boolean }> {
        const result = { okxSdk: false, evmWallet: false };

        try {
            await import('@okx-dex/okx-dex-sdk');
            result.okxSdk = true;
        } catch (error) {
            console.warn('OKX DEX SDK not available:', error);
        }

        try {
            await import('./evm-wallet');
            result.evmWallet = true;
        } catch (error) {
            console.warn('EVM wallet utility not available:', error);
        }

        return result;
    }
}

// Chain ID mapping
export const CHAIN_IDS = {
    // EVM chains
    ETHEREUM: '1',
    BASE: '8453',
    OPTIMISM: '10',
    POLYGON: '137',
    ARBITRUM: '42161',

    // SUI
    SUI_MAINNET: '784'
};

// Common token addresses
export const TOKEN_ADDRESSES = {
    // Native tokens
    NATIVE: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',

    // Ethereum
    ETHEREUM: {
        WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'
    },

    // Base
    BASE: {
        WETH: '0x4200000000000000000000000000000000000006',
        USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
        USDT: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2',
        WBTC: '0x0555E30da8f98308EdB960aa94C0Db47230d2B9c'
    },

    // Optimism
    OPTIMISM: {
        WETH: '0x4200000000000000000000000000000000000006',
        USDC: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
        WBTC: '0x68f180fcCe6836688e9084f035309E29Bf0A2095'
    },

    // SUI
    SUI: {
        SUI: '0x2::sui::SUI',
        WETH: '0xd0e89b2af5e4910726fbcd8b8dd37bb79b29e5f83f7491bca830e94f7f226d29::eth::ETH',
        USDC: '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC',
        USDT: '0x375f70cf2ae4c00bf37117d0c85a2c71545e6ee05c4a5c7d282cd66a4504b068::usdt::USDT',
        WBTC: '0xaafb102dd0902f5055cadecd687fb5b71ca82ef0e0285d90afde828ec58ca96b::btc::BTC'
    }
};