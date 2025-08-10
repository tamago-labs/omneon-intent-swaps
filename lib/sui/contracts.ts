// SUI Network Configuration
export const SUI_CONTRACTS = {
  MAINNET: {
    PACKAGE_ID: '0x2fa86cb35a443fe6ef0c534d1c6f1b8f05750c9043e39548ae708dda8a499337',
    INTENT_RFQ: '0xb63acdb64625249e861f3392546bce6d83f34b8708863608f5c359809e9ef358',
    RESOLVER_REGISTRY: '0xe0c5ffb28451df890ec67a46323c83c0ff140b96766d642e5d0936cd9b49bb49',
    RESOLVER_ADDRESS: '0x98d9d3e7b644182c87310ba8c6c7fdb4a2f2338cd0db58d7e6fa88e562129318',
    TEST_TOKEN: {
      TYPE: '0x2fa86cb35a443fe6ef0c534d1c6f1b8f05750c9043e39548ae708dda8a499337::test_token::TEST_TOKEN',
      SYMBOL: 'TEST',
      DECIMALS: 9
    },
    SUI_TOKEN: {
      TYPE: '0x2::sui::SUI',
      SYMBOL: 'SUI',
      DECIMALS: 9
    }
  }
};

// Chain types as defined in the contract
export const CHAIN_TYPES = {
  EVM: 0,
  SUI: 1,
  SOLANA: 2,
  APTOS: 3,
  BITCOIN: 4,
  MOVEMENT: 5,
  UMI: 6,
  IOTA: 7,
  SUPRA: 8,
  MASSA: 9
};

export const SUI_TOKENS = {
  MAINNET: [
    {
      symbol: 'WETH',
      name: 'Wrapped Ether',
      type: '0xd0e89b2af5e4910726fbcd8b8dd37bb79b29e5f83f7491bca830e94f7f226d29::eth::ETH',
      decimals: 8,
      icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png'
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      type: '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC',
      decimals: 6,
      icon: 'https://etherscan.io/token/images/usdc_ofc_32.svg'
    },
    {
      symbol: 'USDT',
      name: 'Tether USD',
      type: '0x375f70cf2ae4c00bf37117d0c85a2c71545e6ee05c4a5c7d282cd66a4504b068::usdt::USDT',
      decimals: 6,
      icon: 'https://etherscan.io/token/images/tethernew_32.svg'
    },
    {
      symbol: 'WBTC',
      name: 'Wrapped Bitcoin',
      type: '0xaafb102dd0902f5055cadecd687fb5b71ca82ef0e0285d90afde828ec58ca96b::btc::BTC',
      decimals: 8,
      icon: 'https://etherscan.io/token/images/wrappedbtc_ofc_32.svg'
    },
    {
      symbol: 'SUI',
      name: 'Sui',
      type: '0x2::sui::SUI',
      decimals: 9,
      icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/20947.png'
    }
  ]
};

// Helper functions
export function getSuiTokenBySymbol(symbol: string) {
  return SUI_TOKENS.MAINNET.find(token => token.symbol === symbol);
}

export function formatSuiAmount(amount: string | number, decimals: number = 9): string {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  return (value / Math.pow(10, decimals)).toFixed(6);
}

export function parseSuiAmount(amount: string, decimals: number = 9): string {
  const value = parseFloat(amount);
  return (value * Math.pow(10, decimals)).toFixed(0);
}
