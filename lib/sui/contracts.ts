// SUI Network Configuration
export const SUI_CONTRACTS = {
  TESTNET: {
    PACKAGE_ID: '0x5ee4512a9040d43d31d03e01c0b56e70d6459ab16d7d60f8f4d2cfadea4f17f7',
    INTENT_RFQ: '0x1f08af6bba9194bd57ad136420ded025b7edf4d513661ac4806100b44981801a',
    RESOLVER_REGISTRY: '0x1f08af6bba9194bd57ad136420ded025b7edf4d513661ac4806100b44981801a', // Same object, different capability
    RESOLVER_ADDRESS: '0x0ee1f64a7e84369a41bcf11e7fcb9cffcb0125b391327a61e082ecac95357883',
    TEST_TOKEN: {
      TYPE: '0x5ee4512a9040d43d31d03e01c0b56e70d6459ab16d7d60f8f4d2cfadea4f17f7::test_token::TEST_TOKEN',
      SYMBOL: 'TEST',
      DECIMALS: 6
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
  TESTNET: [
    {
      symbol: 'SUI',
      name: 'Sui',
      type: '0x2::sui::SUI',
      decimals: 9,
      icon: '🔷'
    },
    {
      symbol: 'TEST',
      name: 'Test Token',
      type: '0x5ee4512a9040d43d31d03e01c0b56e70d6459ab16d7d60f8f4d2cfadea4f17f7::test_token::TEST_TOKEN',
      decimals: 6,
      icon: '🪙'
    }
  ]
};

// Helper functions
export function getSuiTokenBySymbol(symbol: string) {
  return SUI_TOKENS.TESTNET.find(token => token.symbol === symbol);
}

export function formatSuiAmount(amount: string | number, decimals: number = 9): string {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  return (value / Math.pow(10, decimals)).toFixed(6);
}

export function parseSuiAmount(amount: string, decimals: number = 9): string {
  const value = parseFloat(amount);
  return (value * Math.pow(10, decimals)).toFixed(0);
}
