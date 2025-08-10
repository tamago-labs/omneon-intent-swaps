import axios from 'axios';
import { ethers } from 'ethers';
import crypto from 'crypto';

export interface OKXConfig {
    apiKey: string;
    secretKey: string;
    apiPassphrase: string;
    projectId: string;
    evmRpcUrl: string;
    evmPrivateKey: string;
    suiRpcUrl?: string;
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

export interface SwapData {
    data: string;
    gasPrice: string;
    gasLimit: string;
    value: string;
    to: string;
}

export class OKXDexService {
    private config: OKXConfig;
    private baseUrl = 'https://www.okx.com/api/v5/dex/aggregator';
    private evmProvider: ethers.JsonRpcProvider;
    private evmWallet: ethers.Wallet;

    constructor(config: OKXConfig) {
        this.config = config;
        this.evmProvider = new ethers.JsonRpcProvider(config.evmRpcUrl);
        this.evmWallet = new ethers.Wallet(config.evmPrivateKey, this.evmProvider);
    }

    private generateSignature(timestamp: string, method: string, requestPath: string, body = ''): string {
        const message = timestamp + method + requestPath + body;
        return crypto.createHmac('sha256', this.config.secretKey).update(message).digest('base64');
    }

    private getHeaders(method: string, requestPath: string, body = ''): Record<string, string> {
        const timestamp = new Date().toISOString();
        const signature = this.generateSignature(timestamp, method, requestPath, body);

        return {
            'OK-ACCESS-KEY': this.config.apiKey,
            'OK-ACCESS-SIGN': signature,
            'OK-ACCESS-TIMESTAMP': timestamp,
            'OK-ACCESS-PASSPHRASE': this.config.apiPassphrase,
            'OK-ACCESS-PROJECT': this.config.projectId,
            'Content-Type': 'application/json'
        };
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

            const queryParams = new URLSearchParams({
                chainId: params.chainId,
                fromTokenAddress: params.fromTokenAddress,
                toTokenAddress: params.toTokenAddress,
                amount: params.amount,
                slippage: params.slippage || '0.005'
            });

            const requestPath = `/quote?${queryParams.toString()}`;
            const headers = this.getHeaders('GET', requestPath);

            const response = await axios.get(`${this.baseUrl}${requestPath}`, { headers });

            if (response.data.code !== '0' || !response.data.data || response.data.data.length === 0) {
                throw new Error(response.data.msg || 'No quote data available');
            }

            return response.data.data[0];
        } catch (error: any) {
            console.error('Error getting quote:', error.response?.data || error.message);
            throw new Error(`Failed to get quote: ${error.response?.data?.msg || error.message}`);
        }
    }

    async getSwapData(params: {
        chainId: string;
        fromTokenAddress: string;
        toTokenAddress: string;
        amount: string;
        userWalletAddress: string;
        slippage?: string;
    }): Promise<SwapData> {
        try {
            console.log(`Getting swap data for chain ${params.chainId}`);

            const requestBody = {
                chainId: params.chainId,
                fromTokenAddress: params.fromTokenAddress,
                toTokenAddress: params.toTokenAddress,
                amount: params.amount,
                userWalletAddress: params.userWalletAddress,
                slippage: params.slippage || '0.005'
            };

            const requestPath = '/swap';
            const body = JSON.stringify(requestBody);
            const headers = this.getHeaders('POST', requestPath, body);

            const response = await axios.post(`${this.baseUrl}${requestPath}`, requestBody, { headers });

            if (response.data.code !== '0' || !response.data.data || response.data.data.length === 0) {
                throw new Error(response.data.msg || 'No swap data available');
            }

            return response.data.data[0].tx;
        } catch (error: any) {
            console.error('Error getting swap data:', error.response?.data || error.message);
            throw new Error(`Failed to get swap data: ${error.response?.data?.msg || error.message}`);
        }
    }

    async executeEvmSwap(params: {
        chainId: string;
        fromTokenAddress: string;
        toTokenAddress: string;
        amount: string;
        userWalletAddress: string;
        slippage?: string;
    }) {
        try {
            console.log(`Executing EVM swap on chain ${params.chainId}`);

            const swapData = await this.getSwapData(params);

            const transaction = {
                to: swapData.to,
                data: swapData.data,
                value: swapData.value,
                gasLimit: swapData.gasLimit,
                gasPrice: swapData.gasPrice
            };

            console.log('Sending transaction:', transaction);

            const txResponse = await this.evmWallet.sendTransaction(transaction);

            console.log('Transaction sent:', txResponse.hash);

            const receipt = await txResponse.wait();

            console.log('EVM swap completed:', receipt?.hash);

            return {
                transactionHash: receipt?.hash,
                blockNumber: receipt?.blockNumber,
                gasUsed: receipt?.gasUsed?.toString(),
                status: receipt?.status
            };
        } catch (error: any) {
            console.error('Error executing EVM swap:', error);
            throw new Error(`EVM swap failed: ${error.message}`);
        }
    }

    async checkApproval(params: {
        chainId: string;
        tokenAddress: string;
        amount: string;
        spenderAddress?: string;
    }): Promise<{ needsApproval: boolean; allowance: string }> {
        try {
            if (params.tokenAddress === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') {
                return { needsApproval: false, allowance: 'unlimited' };
            }

            const requestPath = `/approve/allowance?chainId=${params.chainId}&tokenContractAddress=${params.tokenAddress}&approveAmount=${params.amount}`;
            const headers = this.getHeaders('GET', requestPath);

            const response = await axios.get(`${this.baseUrl}${requestPath}`, { headers });

            if (response.data.code !== '0') {
                throw new Error(response.data.msg || 'Failed to check allowance');
            }

            const allowance = response.data.data[0]?.allowance || '0';
            const needsApproval = BigInt(allowance) < BigInt(params.amount);

            return { needsApproval, allowance };
        } catch (error: any) {
            console.error('Error checking approval:', error);
            return { needsApproval: true, allowance: '0' };
        }
    }

    async executeApproval(params: {
        chainId: string;
        tokenAddress: string;
        amount: string;
    }) {
        try {
            console.log(`Executing approval for token ${params.tokenAddress}`);

            const requestBody = {
                chainId: params.chainId,
                tokenContractAddress: params.tokenAddress,
                approveAmount: params.amount
            };

            const requestPath = '/approve/transaction';
            const body = JSON.stringify(requestBody);
            const headers = this.getHeaders('POST', requestPath, body);

            const response = await axios.post(`${this.baseUrl}${requestPath}`, requestBody, { headers });

            if (response.data.code !== '0' || !response.data.data || response.data.data.length === 0) {
                throw new Error(response.data.msg || 'No approval data available');
            }

            const approvalData = response.data.data[0];

            const transaction = {
                to: approvalData.to,
                data: approvalData.data,
                value: approvalData.value || '0',
                gasLimit: approvalData.gasLimit,
                gasPrice: approvalData.gasPrice
            };

            const txResponse = await this.evmWallet.sendTransaction(transaction);
            const receipt = await txResponse.wait();

            console.log('Token approval completed:', receipt?.hash);

            return {
                transactionHash: receipt?.hash,
                blockNumber: receipt?.blockNumber,
                gasUsed: receipt?.gasUsed?.toString(),
                status: receipt?.status
            };
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

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
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