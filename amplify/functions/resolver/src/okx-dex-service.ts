import { OKXDexClient } from '@okx-dex/okx-dex-sdk'; 
import { createEVMWallet } from '@okx-dex/okx-dex-sdk/dist/core/evm-wallet';
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
    private evmClient: OKXDexClient;
    private suiClient: any;
    private config: OKXConfig;

    constructor(config: OKXConfig) {
        this.config = config;

        // Initialize EVM client
        const evmProvider = new ethers.JsonRpcProvider(this.getRpcUrl('evm'));
        const evmWallet = createEVMWallet(config.evmPrivateKey, evmProvider);

        this.evmClient = new OKXDexClient({
            apiKey: config.apiKey,
            secretKey: config.secretKey,
            apiPassphrase: config.apiPassphrase,
            projectId: config.projectId,
            evm: {
                wallet: evmWallet
            }
        });

        // Initialize SUI client if private key is provided
        if (config.suiPrivateKey) {

            const wallet = Ed25519Keypair.fromSecretKey(config.suiPrivateKey);

            this.suiClient = new OKXDexClient({
                apiKey: config.apiKey,
                secretKey: config.secretKey,
                apiPassphrase: config.apiPassphrase,
                projectId: config.projectId,
                sui: {
                    privateKey: config.suiPrivateKey,
                    walletAddress: wallet.getPublicKey().toSuiAddress(),
                    connection: {
                        rpcUrl: 'https://fullnode.mainnet.sui.io'
                    }
                }
            });
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

            const client = params.chainId === '784' ? this.suiClient : this.evmClient;

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

            // Update EVM provider for the specific chain
            const rpcUrl = this.getRpcUrl('evm', params.chainId);
            const evmProvider = new ethers.JsonRpcProvider(rpcUrl);
            const evmWallet = createEVMWallet(this.config.evmPrivateKey, evmProvider);

            // Create new client with updated provider
            const client = new OKXDexClient({
                apiKey: this.config.apiKey,
                secretKey: this.config.secretKey,
                apiPassphrase: this.config.apiPassphrase,
                projectId: this.config.projectId,
                evm: {
                    wallet: evmWallet
                }
            });

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

            if (!this.suiClient) {
                throw new Error('SUI client not initialized - missing SUI private key');
            }

            const swapResult = await this.suiClient.dex.executeSwap({
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

    async checkApproval(params: {
        chainId: string;
        tokenAddress: string;
        amount: string;
    }): Promise<{ needsApproval: boolean; allowance: string }> {
        try {
            if (params.tokenAddress === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') {
                return { needsApproval: false, allowance: 'unlimited' };
            }

            // Update EVM provider for the specific chain
            const rpcUrl = this.getRpcUrl('evm', params.chainId);
            const evmProvider = new ethers.JsonRpcProvider(rpcUrl);
            const evmWallet = createEVMWallet(this.config.evmPrivateKey, evmProvider);

            const client = new OKXDexClient({
                apiKey: this.config.apiKey,
                secretKey: this.config.secretKey,
                apiPassphrase: this.config.apiPassphrase,
                projectId: this.config.projectId,
                evm: {
                    wallet: evmWallet
                }
            });

            const result = await client.dex.executeApproval({
                chainId: params.chainId,
                tokenContractAddress: params.tokenAddress,
                approveAmount: params.amount
            });

            if ('alreadyApproved' in result) {
                return { needsApproval: false, allowance: params.amount };
            } else {
                return { needsApproval: true, allowance: '0' };
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
            console.log(`Executing approval for token ${params.tokenAddress}`);

            // Update EVM provider for the specific chain
            const rpcUrl = this.getRpcUrl('evm', params.chainId);
            const evmProvider = new ethers.JsonRpcProvider(rpcUrl);
            const evmWallet = createEVMWallet(this.config.evmPrivateKey, evmProvider);

            const client = new OKXDexClient({
                apiKey: this.config.apiKey,
                secretKey: this.config.secretKey,
                apiPassphrase: this.config.apiPassphrase,
                projectId: this.config.projectId,
                evm: {
                    wallet: evmWallet
                }
            });

            const result = await client.dex.executeApproval({
                chainId: params.chainId,
                tokenContractAddress: params.tokenAddress,
                approveAmount: params.amount
            });

            if ('alreadyApproved' in result) {
                console.log('Token already approved');
                return {
                    transactionHash: 'already_approved',
                    status: 1
                };
            } else {
                console.log('Token approval completed:', result.transactionHash);
                return {
                    transactionHash: result.transactionHash,
                    explorerUrl: result.explorerUrl
                };
            }
        } catch (error: any) {
            console.error('Error executing approval:', error);
            throw new Error(`Token approval failed: ${error.message}`);
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
