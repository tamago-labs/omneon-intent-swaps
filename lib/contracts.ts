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
  ETHEREUM: {
    chainId: 1,
    name: 'Ethereum',
    chainType: ChainType.EVM,
    rpcUrl: process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL || 'https://eth.llamarpc.com',
    blockExplorer: 'https://etherscan.io',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18
    }
  },
  BASE: {
    chainId: 8453,
    name: 'Base',
    chainType: ChainType.EVM,
    rpcUrl: process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org',
    blockExplorer: 'https://basescan.org',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18
    }
  },
  OPTIMISM: {
    chainId: 10,
    name: 'Optimism',
    chainType: ChainType.EVM,
    rpcUrl: process.env.NEXT_PUBLIC_OPTIMISM_RPC_URL || 'https://mainnet.optimism.io',
    blockExplorer: 'https://optimistic.etherscan.io',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18
    }
  },
  SUI: {
    chainId: 0, // SUI doesn't use numeric chain IDs
    name: 'SUI',
    chainType: ChainType.SUI,
    rpcUrl: process.env.NEXT_PUBLIC_SUI_RPC_URL || 'https://fullnode.mainnet.sui.io',
    blockExplorer: 'https://suivision.xyz',
    nativeCurrency: {
      name: 'SUI',
      symbol: 'SUI',
      decimals: 9
    }
  }
};

// Contract addresses on different networks
export const CONTRACTS = {
  ETHEREUM: {
    IntentRFQ: '0x9feb0D7447081835d058D4a9de4F89f4651586Cb' as Address,
    ResolverRegistry: '0x96D188A974a3d43578eE55da240361c72A7b1610' as Address,
    WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' as Address,
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as Address,
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7' as Address,
    WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599' as Address,
  },
  BASE: {
    IntentRFQ: '0xfC44EF149b458Bab72A4AE6F870CaBf7575D955e' as Address,
    ResolverRegistry: '0x49067a1b9F07ac6b2Df9eB95e649A796B16478a6' as Address,
    WETH: '0x4200000000000000000000000000000000000006' as Address,
    USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as Address,
    USDT: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2' as Address,
    WBTC: '0x0555E30da8f98308EdB960aa94C0Db47230d2B9c' as Address,
  },
  OPTIMISM: {
    IntentRFQ: '0x38170B724fa94B48AAA52dCd45438Da718138550' as Address,
    ResolverRegistry: '0x9DaBaFa492188093116cfEDee1b13aD76b1c1742' as Address,
    WETH: '0x4200000000000000000000000000000000000006' as Address,
    USDC: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85' as Address,
    WBTC: '0x68f180fcCe6836688e9084f035309E29Bf0A2095' as Address,
  }
};

// Hardcoded Resolver Addresses
export const EVM_RESOLVER_ADDRESS = '0xee098fEA55039762bC5db10a512588a33e9F965E' as Address;

// Token configurations
export const TOKENS = {
  ETHEREUM: [
    {
      address: CONTRACTS.ETHEREUM.WETH,
      symbol: 'WETH',
      name: 'Wrapped Ether',
      decimals: 18,
      icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
      chainId: NETWORKS.ETHEREUM.chainId
    },
    {
      address: CONTRACTS.ETHEREUM.USDC,
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      icon: 'https://etherscan.io/token/images/usdc_ofc_32.svg',
      chainId: NETWORKS.ETHEREUM.chainId
    },
    {
      address: CONTRACTS.ETHEREUM.USDT,
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
      icon: 'https://etherscan.io/token/images/tethernew_32.svg',
      chainId: NETWORKS.ETHEREUM.chainId
    },
    {
      address: CONTRACTS.ETHEREUM.WBTC,
      symbol: 'WBTC',
      name: 'Wrapped Bitcoin',
      decimals: 8,
      icon: 'https://etherscan.io/token/images/wrappedbtc_ofc_32.svg',
      chainId: NETWORKS.ETHEREUM.chainId
    }
  ],
  BASE: [
    {
      address: CONTRACTS.BASE.WETH,
      symbol: 'WETH',
      name: 'Wrapped Ether',
      decimals: 18,
      icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
      chainId: NETWORKS.BASE.chainId
    },
    {
      address: CONTRACTS.BASE.USDC,
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      icon: 'https://etherscan.io/token/images/usdc_ofc_32.svg',
      chainId: NETWORKS.BASE.chainId
    },
    {
      address: CONTRACTS.BASE.USDT,
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
      icon: 'https://etherscan.io/token/images/tethernew_32.svg',
      chainId: NETWORKS.BASE.chainId
    },
    {
      address: CONTRACTS.BASE.WBTC,
      symbol: 'WBTC',
      name: 'Wrapped Bitcoin',
      decimals: 8,
      icon: 'https://etherscan.io/token/images/wrappedbtc_ofc_32.svg',
      chainId: NETWORKS.BASE.chainId
    }
  ],
  OPTIMISM: [
    {
      address: CONTRACTS.OPTIMISM.WETH,
      symbol: 'WETH',
      name: 'Wrapped Ether',
      decimals: 18,
      icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
      chainId: NETWORKS.OPTIMISM.chainId
    },
    {
      address: CONTRACTS.OPTIMISM.USDC,
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      icon: 'https://etherscan.io/token/images/usdc_ofc_32.svg',
      chainId: NETWORKS.OPTIMISM.chainId
    },
    {
      address: CONTRACTS.OPTIMISM.WBTC,
      symbol: 'WBTC',
      name: 'Wrapped Bitcoin',
      decimals: 8,
      icon: 'https://etherscan.io/token/images/wrappedbtc_ofc_32.svg',
      chainId: NETWORKS.OPTIMISM.chainId
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
    case 'Ethereum':
      return NETWORKS.ETHEREUM.chainId;
    case 'Base':
      return NETWORKS.BASE.chainId;
    case 'Optimism':
      return NETWORKS.OPTIMISM.chainId;
    case 'SUI':
      return 0; // SUI doesn't use numeric chain IDs
    default:
      return NETWORKS.ETHEREUM.chainId;
  }
}

// Helper function to get chain name from chain ID
export function getChainName(chainId: number): string {
  switch(chainId) {
    case 1:
      return 'Ethereum';
    case 11155111:
      return 'Sepolia';
    case 8453:
      return 'Base';
    case 84532:
      return 'Base Sepolia';
    case 10:
      return 'Optimism';
    case 420:
      return 'Optimism Goerli';
    case 137:
      return 'Polygon';
    case 80001:
      return 'Polygon Mumbai';
    case 42161:
      return 'Arbitrum One';
    case 421613:
      return 'Arbitrum Goerli';
    case 0:
      return 'SUI';
    default:
      return 'Ethereum'; // Default fallback
  }
}

// Helper function to get chain type from chain name
export function getChainType(chainName: string): ChainType {
  switch(chainName) {
    case 'Ethereum':
    case 'Base':
    case 'Optimism':
    case 'Polygon':
    case 'BNB Chain':
      return ChainType.EVM;
    case 'SUI':
      return ChainType.SUI;
    case 'Solana':
      return ChainType.SOLANA;
    default:
      return ChainType.EVM;
  }
}
 

// Helper to get contract addresses for a chain
export function getContractsForChain(chainName: string) {
  switch(chainName) {
    case 'Ethereum':
      return CONTRACTS.ETHEREUM;
    case 'Base':
      return CONTRACTS.BASE;
    case 'Optimism':
      return CONTRACTS.OPTIMISM;
    default:
      return CONTRACTS.ETHEREUM;
  }
}

// Helper to get tokens for a chain
export function getTokensForChain(chainName: string) {
  switch(chainName) {
    case 'Ethereum':
      return TOKENS.ETHEREUM;
    case 'Base':
      return TOKENS.BASE;
    case 'Optimism':
      return TOKENS.OPTIMISM;
    default:
      return TOKENS.ETHEREUM;
  }
}

// Helper to get token address from symbol
export function getTokenAddress(symbol: string, chainName: string): Address {
  const tokens = getTokensForChain(chainName);
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
