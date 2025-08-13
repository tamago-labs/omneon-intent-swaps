# Omneon - Omni Intent Swaps EVM ↔ MoveVM

Omneon is an intent-based cross-chain swap protocol that enables seamless swaps within or between Ethereum and Move ecosystems using off-chain AI-based resolvers and Merkle Tree proofs. Instead of manually finding the best prices and handling complex transactions yourself, the system allows you to follow simple steps as follows:

1. **Tell us what you want** - Simply describe your intention (like "I want to trade 100 USDC for ETH at the best available rate")
2. **AI handles the rest** - The off-chain AI resolvers automatically interpret the request, find the best prices and execute the swap.
3. **Get your tokens** - The system sends your new tokens directly to your wallet.

### Features

- **4 Chains Support:** Ethereum, Base, Optimism and SUI Mainnets
- **Off-chain resolvers:** Resolvers use optimal execution across DEXs using OKX DEX API integration
- **Intent-Based Trading with AI:** Set conditions in natural language and let resolvers interpret and execute them.
- **Secure verification:** Uses Merkle Tree proofs to ensure transaction integrity

*We are in the early development stage of the project. Full functionality is working on SUI same-chain swaps while EVM to EVM and cross-chain swaps are partially functional*

## Components

The project comprises several components including frontend, serverless backend and smart contracts as follows:

- **Frontend/Backend** - Built with AWS Amplify, frontend in Next.js and backend comprising AWS real-time database, GraphQL services, AI-services including managed services to run resolver nodes in a safe and secure environment
- **Smart contracts** - In EVM and SUI Move that can be found at /contracts.

## Smart Contracts

### EVM Contracts (Solidity)

- `IntentRFQ.sol` - Main order creation and management
- `ResolverRegistry.sol` - Resolver registration and reputation
- Uses Merkle proofs to track on-chain orders with significantly lower gas costs

### SUI Contracts (Move)

- `intent_rfq.move` - Intent pool management, similar to the EVM contract
- `merkle_proof.move` - OpenZeppelin-cloned Merkle proof verification library

### Resolver System

Omneon operates through a network of **off-chain resolver nodes** that handle the complex execution of cross-chain intents. Currently, the system runs with a single resolver node serving 4 blockchains.

The system's strength lies in its simplicity for end users: they only need to define their intent (what they want to achieve), while resolvers handle all the technical complexity behind the scenes. Future iterations will expand to a fully functional network where multiple resolvers can specialize in specific chains, integrate diverse liquidity sources beyond OKX DEX API (including CEX integration), and compete on execution strategies to provide the best possible outcomes for users.

## Current Execution Flow

### **1. Intent Creation & Registration**
```javascript
const intent = {
  sourceChain: 'Ethereum',
  sourceToken: 'WETH',
  amount: '1.5',
  destChain: 'SUI',
  destToken: 'SUI',
  condition: 'immediately at market rate'
};
```

```solidity
function createIntent(Intent memory intent) external payable {
    require(intent.deadline > block.timestamp, "Intent expired");
    require(intent.amount > 0, "Invalid amount");
    bytes32 intentId = keccak256(abi.encode(intent, block.timestamp));
    intents[intentId] = intent;
    emit IntentCreated(intentId, msg.sender);
}
```

### **2. Resolver Processing & Execution**
```javascript
async function processIntent(intentId) {
  const intent = await fetchIntent(intentId);
  
  // Validate execution conditions
  if (!await checkConditions(intent)) {
    return { status: 'WAITING' };
  }
  
  // Find optimal route
  const route = await findBestRoute(intent);
  return await executeIntent(intent, route);
}
```

### **3. Cross-Chain Execution**
```javascript
if (intent.sourceChain !== intent.destChain) {
  await executeSourceSwap(intent);     // Swap on source chain
  await bridgeAssets(intent);          // Bridge to destination chain
  await executeDestinationSwap(intent);// Swap on destination chain
}
```
 

## Deployment
| Network | Contract | Address |
|---------|----------|---------|
| **Ethereum Mainnet** | INTENT_RFQ | `0x9feb0D7447081835d058D4a9de4F89f4651586Cb` |
| | RESOLVER_REGISTRY | `0x96D188A974a3d43578eE55da240361c72A7b1610` |
| **Base Mainnet** | INTENT_RFQ | `0xfC44EF149b458Bab72A4AE6F870CaBf7575D955e` |
| | RESOLVER_REGISTRY | `0x49067a1b9F07ac6b2Df9eB95e649A796B16478a6` |
| **Optimism Mainnet** | INTENT_RFQ | `0x38170B724fa94B48AAA52dCd45438Da718138550` |
| | RESOLVER_REGISTRY | `0x9DaBaFa492188093116cfEDee1b13aD76b1c1742` |
| **Sui Mainnet** | Package ID | `0x2fa86cb35a443fe6ef0c534d1c6f1b8f05750c9043e39548ae708dda8a499337` |
| | ResolverRegistry | `0xe0c5ffb28451df890ec67a46323c83c0ff140b96766d642e5d0936cd9b49bb49` |
| | IntentRFQ | `0xb63acdb64625249e861f3392546bce6d83f34b8708863608f5c359809e9ef358` |

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This library is licensed under the MIT-0 License. See the LICENSE file.
