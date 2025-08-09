// Contract addresses, ABIs, and network configurations
import { Address } from 'viem';

// Chain configurations
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
  Unknown = 0,
  Pending = 1,
  Completed = 2,
  Cancelled = 3
}

// Network configurations
export const NETWORKS = {
  SEPOLIA: {
    chainId: 11155111,
    name: 'Ethereum Sepolia',
    chainType: ChainType.EVM,
    rpcUrl: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || 'https://eth-sepolia.public.blastapi.io',
    blockExplorer: 'https://sepolia.etherscan.io',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18
    }
  },
  SUI_TESTNET: {
    chainId: 0, // SUI doesn't use numeric chain IDs
    name: 'SUI Testnet',
    chainType: ChainType.SUI,
    rpcUrl: 'https://fullnode.testnet.sui.io',
    blockExplorer: 'https://testnet.suivision.xyz',
    nativeCurrency: {
      name: 'SUI',
      symbol: 'SUI',
      decimals: 9
    }
  }
};

// Contract addresses on different networks
export const CONTRACTS = {
  SEPOLIA: {
    IntentRFQ: '0x0acDdC1CEC5642f613738Fa4A1bEE00486f9033E' as Address,
    MockUSDC: '0x6a1804E37F32062451f29Ab46aD9Dd1F101E1898' as Address,
    MockWETH: '0x502590b643570D8255dA59bec2A062611B3d0479' as Address,
    MockWBTC: '0x526176c7dD65d18b3Fc37109C296B79D2fb8f57e' as Address,
  },
  SUI_TESTNET: {
    // Add SUI contract addresses when available
    IntentRFQ: '', 
    ResolverRegistry: '',
  }
};

// Token configurations
export const TOKENS = {
  SEPOLIA: [
    {
      address: CONTRACTS.SEPOLIA.MockUSDC,
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      icon: '💵',
      chainId: NETWORKS.SEPOLIA.chainId
    },
    {
      address: CONTRACTS.SEPOLIA.MockWETH,
      symbol: 'WETH',
      name: 'Wrapped Ether',
      decimals: 18,
      icon: '⟠',
      chainId: NETWORKS.SEPOLIA.chainId
    },
    {
      address: CONTRACTS.SEPOLIA.MockWBTC,
      symbol: 'WBTC',
      name: 'Wrapped Bitcoin',
      decimals: 8,
      icon: '₿',
      chainId: NETWORKS.SEPOLIA.chainId
    }
  ],
  SUI_TESTNET: [
    {
      address: '0x2::sui::SUI',
      symbol: 'SUI',
      name: 'SUI',
      decimals: 9,
      icon: '🔷',
      chainId: 0
    }
  ]
};

// IntentRFQ Contract ABI (minimal for needed functions)
export const INTENT_RFQ_ABI = [
  {
    "inputs": [
      { "internalType": "enum IIntentRFQ.ChainType", "name": "sourceType", "type": "uint8" },
      { "internalType": "uint256", "name": "sourceChainId", "type": "uint256" },
      { "internalType": "address", "name": "tokenIn", "type": "address" },
      { "internalType": "uint256", "name": "amountIn", "type": "uint256" },
      { "internalType": "enum IIntentRFQ.ChainType", "name": "destType", "type": "uint8" },
      { "internalType": "uint256", "name": "destChainId", "type": "uint256" },
      { "internalType": "address", "name": "tokenOut", "type": "address" },
      { "internalType": "uint256", "name": "minAmountOut", "type": "uint256" },
      { "internalType": "address", "name": "resolver", "type": "address" }
    ],
    "name": "createOrder",
    "outputs": [{ "internalType": "bytes32", "name": "intentId", "type": "bytes32" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }],
    "name": "calculateFee",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "feeRate",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getStatusRoots",
    "outputs": [
      { "internalType": "bytes32", "name": "pending", "type": "bytes32" },
      { "internalType": "bytes32", "name": "completed", "type": "bytes32" },
      { "internalType": "bytes32", "name": "cancelled", "type": "bytes32" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "intentId", "type": "bytes32" },
      { "indexed": true, "name": "user", "type": "address" },
      { "indexed": true, "name": "resolver", "type": "address" }
    ],
    "name": "OrderCreated",
    "type": "event"
  }
] as const;

// ERC20 ABI (minimal for approval and balance)
export const ERC20_ABI = [
  {
    "inputs": [{ "name": "owner", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "owner", "type": "address" },
      { "name": "spender", "type": "address" }
    ],
    "name": "allowance",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "spender", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{ "name": "", "type": "uint8" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [{ "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Helper function to get chain ID from chain name
export function getChainId(chainName: string): number {
  switch(chainName) {
    case 'Ethereum Sepolia':
    case 'Ethereum':
      return NETWORKS.SEPOLIA.chainId;
    case 'SUI':
    case 'SUI Testnet':
      return 0; // SUI doesn't use numeric chain IDs
    default:
      return NETWORKS.SEPOLIA.chainId;
  }
}

// Helper function to get chain type from chain name
export function getChainType(chainName: string): ChainType {
  switch(chainName) {
    case 'Ethereum Sepolia':
    case 'Ethereum':
    case 'Base':
    case 'Polygon':
    case 'BNB Chain':
    case 'Optimism':
      return ChainType.EVM;
    case 'SUI':
    case 'SUI Testnet':
      return ChainType.SUI;
    case 'Solana':
      return ChainType.SOLANA;
    default:
      return ChainType.EVM;
  }
}

// Helper to get token address from symbol
export function getTokenAddress(symbol: string, chainName: string): Address {
  const chainId = getChainId(chainName);
  const tokens = chainId === NETWORKS.SEPOLIA.chainId ? TOKENS.SEPOLIA : TOKENS.SUI_TESTNET;
  const token = tokens.find(t => t.symbol === symbol);
  return (token?.address || '0x0000000000000000000000000000000000000000') as Address;
}

// Helper to format token amount
export function formatTokenAmount(amount: bigint, decimals: number): string {
  const divisor = BigInt(10 ** decimals);
  const whole = amount / divisor;
  const remainder = amount % divisor;
  
  if (remainder === 0n) {
    return whole.toString();
  }
  
  const remainderStr = remainder.toString().padStart(decimals, '0');
  const trimmedFraction = remainderStr.replace(/0+$/, '');
  
  // Limit to 6 decimal places for display
  const displayFraction = trimmedFraction.slice(0, 6);
  
  return `${whole}.${displayFraction}`;
}

// Helper to parse token amount
export function parseTokenAmount(amount: string, decimals: number): bigint {
  try {
    const [whole, fraction = ''] = amount.split('.');
    const fractionPadded = fraction.padEnd(decimals, '0').slice(0, decimals);
    const combined = whole + fractionPadded;
    return BigInt(combined);
  } catch {
    return 0n;
  }
}