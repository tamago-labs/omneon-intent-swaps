import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  Resolver: a
    .model({
      name: a.string().required(),
      description: a.string(),
      country: a.string(),
      website: a.url(),
      email: a.email(),
      isActive: a.boolean().default(true),
      reputation: a.integer().default(100),
      totalExecuted: a.integer().default(0),
      supportedChains: a.string().array(), // JSON array of supported ChainType
      walletAddress: a.string().array(),
      avgExecutionTime: a.float(), // In seconds
      successRate: a.float().default(100.0), // Percentage
      volume24h: a.string().default("0"), // BigNumber as string
      volumeTotal: a.string().default("0"), // BigNumber as string 
      telegram: a.string(),
      discord: a.string(),
      twitter: a.string(),
      orders: a.hasMany("Order", "resolverId"),
    })
    .authorization((allow) => [
      allow.publicApiKey(),
    ]),
  Wallet: a
    .model({
      address: a.string().required(), // Wallet address
      chainType: a.integer(), // 0: EVM, 1: SUI, 2: SOLANA, 3: APTOS, 4: BITCOIN, 5: MOVEMENT, 6: UMI, 7: IOTA, 8: SUPRA, 9: MASSA
      chainId: a.integer(), //  when set as EVM
      displayName: a.string(),
      totalOrders: a.integer().default(0),
      totalVolume: a.string().default("0"), // BigNumber as string
      successfulOrders: a.integer().default(0),
      orders: a.hasMany("Order", "userId")
    })
    .authorization((allow) => [
      allow.publicApiKey()
    ]),
  Order: a
    .model({
      userId: a.id().required(),
      user: a.belongsTo("Wallet", "userId"),
      resolverId: a.id().required(),
      resolver: a.belongsTo("Resolver", "resolverId"),
      intentId: a.string().required(), // bytes32 from smart contract also duplicate it for ID 
      sourceChainType: a.integer(), // 0: EVM, 1: SUI, 2: SOLANA, 3: APTOS, 4: BITCOIN, 5: MOVEMENT, 6: UMI, 7: IOTA, 8: SUPRA, 9: MASSA
      sourceChainId: a.integer(), //  when set as EVM
      sourceTokenAddress: a.string().required(),
      sourceTokenSymbol: a.string(),
      sourceTokenDecimals: a.integer().default(18),
      amountIn: a.string().required(), // BigNumber as string
      destChainType: a.integer(), // 0: EVM, 1: SUI, 2: SOLANA, 3: APTOS, 4: BITCOIN, 5: MOVEMENT, 6: UMI, 7: IOTA, 8: SUPRA, 9: MASSA
      destChainId: a.integer(), //  when set as EVM
      destTokenAddress: a.string().required(),
      destTokenSymbol: a.string(),
      destTokenDecimals: a.integer().default(18),
      minAmountOut: a.string().required(), // BigNumber as string
      actualAmountOut: a.string(), // Filled when completed 
      // Order Status
      status: a.enum(["PENDING", "COMPLETED", "CANCELLED", "FAILED", "EXPIRED"]),
      // Execution condition (all in JSON)
      executionCondition: a.json(),
      // Financial Info
      feeAmount: a.string(), // Protocol fee in source token
      exchangeRate: a.float(), // Rate when executed 
      // Execution Info
      txHashSource: a.string(), // Transaction hash on source chain
      txHashDest: a.string(), // Transaction hash on destination chain
      blockNumberSource: a.integer(),
      blockNumberDest: a.integer(),
      executedAt: a.datetime(), // When resolver executed
      completedAt: a.datetime(), // When marked as completed
      expiresAt: a.datetime(), // Order expiration 
      merkleRoot: a.string(), // Root hash when status was updated
      merkleProof: a.string().array(), // Proof array for verification
      errorReason: a.string(), // If failed
      retryCount: a.integer().default(0)
    })
    .authorization((allow) => [
      allow.publicApiKey()
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
