// Types and constants for the resolver system

export interface OrderData {
  id: string;
  userId: string;
  senderAddress: string;
  recipientAddress: string;
  resolverId: string;
  intentId: string;
  sourceChainType: number;
  sourceChainId: number;
  sourceTokenAddress: string;
  sourceTokenSymbol: string;
  sourceTokenDecimals: number;
  amountIn: string;
  destChainType: number;
  destChainId: number;
  destTokenAddress: string;
  destTokenSymbol: string;
  destTokenDecimals: number;
  minAmountOut: string;
  actualAmountOut?: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'FAILED' | 'EXPIRED';
  executionCondition?: any;
  feeAmount?: string;
  exchangeRate?: number;
  txHashSource?: string;
  txHashDest?: string;
  blockNumberSource?: number;
  blockNumberDest?: number;
  executedAt?: string;
  completedAt?: string;
  expiresAt?: string;
  merkleRoot?: string;
  merkleProof?: string[];
  errorReason?: string;
  retryCount: number;
}

export enum ChainType {
  EVM = 0,
  SUI = 1,
  SOLANA = 2,
  APTOS = 3,
  BITCOIN = 4,
  MOVEMENT = 5,
  UMI = 6,
  IOTA = 7,
  SUPRA = 8,
  MASSA = 9
}

export enum OrderStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED'
}

// Chain ID mappings for supported chains
export const SUPPORTED_CHAINS = {
  EVM: {
    ETHEREUM_MAINNET: 1,
    ETHEREUM_SEPOLIA: 11155111,
    BASE: 8453,
    POLYGON: 137,
    BNB: 56,
    OPTIMISM: 10,
    ARBITRUM: 42161
  },
  SUI: {
    MAINNET: 0,
    TESTNET: 0, // SUI uses different network identification
    DEVNET: 0
  }
};

// Cross-chain support matrix
export const CROSS_CHAIN_ROUTES = [
  {
    source: { chainType: ChainType.EVM, chainId: SUPPORTED_CHAINS.EVM.ETHEREUM_SEPOLIA },
    dest: { chainType: ChainType.SUI, chainId: SUPPORTED_CHAINS.SUI.TESTNET }
  },
  {
    source: { chainType: ChainType.SUI, chainId: SUPPORTED_CHAINS.SUI.TESTNET },
    dest: { chainType: ChainType.EVM, chainId: SUPPORTED_CHAINS.EVM.ETHEREUM_SEPOLIA }
  }
];

export interface ProcessingResult {
  success: boolean;
  txHash?: string;
  actualAmountOut?: string;
  errorReason?: string;
}

export interface ResolverConfig {
  maxRetries: number;
  feeRate: number; // in basis points (30 = 0.3%)
  minExecutionAmount: string;
  supportedTokens: {
    [chainType: number]: {
      [chainId: number]: string[]; // token addresses
    };
  };
}

export const DEFAULT_RESOLVER_CONFIG: ResolverConfig = {
  maxRetries: 3,
  feeRate: 30, // 0.3%
  minExecutionAmount: '1000', // minimum 1000 wei/smallest unit
  supportedTokens: {
    [ChainType.EVM]: {
      [SUPPORTED_CHAINS.EVM.ETHEREUM_SEPOLIA]: [
        '0x...', // USDC
        '0x...', // WETH
        '0x...'  // WBTC
      ]
    },
    [ChainType.SUI]: {
      [SUPPORTED_CHAINS.SUI.TESTNET]: [
        '0x2::sui::SUI',
        '0x5ee4512a9040d43d31d03e01c0b56e70d6459ab16d7d60f8f4d2cfadea4f17f7::test_token::TEST_TOKEN'
      ]
    }
  }
};
