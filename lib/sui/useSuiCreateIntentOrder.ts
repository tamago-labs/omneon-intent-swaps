import { useState } from 'react';
import { Transaction } from '@mysten/sui/transactions';
import { SUI_CONTRACTS, getSuiTokenBySymbol, parseSuiAmount, CHAIN_TYPES } from './contracts';
import { orderAPI, userAPI, resolverAPI } from '@/lib/api';
import { suiClient, getTokenDecimals } from './useSuiBalances';

interface CreateSuiIntentOrderParams {
  sourceToken: string;
  amount: string;
  destToken: string;
  minAmountOut: string;
  slippage: string;
  deadline: string;
  condition?: string;
  userAddress: string;
}

export function useSuiCreateIntentOrder() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [state, setState] = useState<'idle' | 'checking' | 'creating' | 'success'>('idle');

  const createSuiIntentOrder = async (params: CreateSuiIntentOrderParams, signAndExecuteTransaction: any) => {
    if (!params.userAddress) {
      throw new Error('Wallet not connected');
    }

    setIsSubmitting(true);
    setState('checking');

    try {
      console.log('Creating SUI intent order with params:', params);

      // Get token info
      const sourceTokenInfo = getSuiTokenBySymbol(params.sourceToken);
      const destTokenInfo = getSuiTokenBySymbol(params.destToken);

      if (!sourceTokenInfo || !destTokenInfo) {
        throw new Error('Invalid token selection');
      }

      // Get actual decimals from chain
      console.log('Fetching token decimals...');
      const sourceDecimals = await getTokenDecimals(sourceTokenInfo.type);
      const destDecimals = await getTokenDecimals(destTokenInfo.type);
      
      console.log(`Source token ${params.sourceToken} decimals:`, sourceDecimals);
      console.log(`Dest token ${params.destToken} decimals:`, destDecimals);

      setState('creating');

      // Create transaction
      const tx = new Transaction();
      tx.setGasBudget(50000000);

      // Get coins for the source token
      let coinType = sourceTokenInfo.type;
      if (params.sourceToken === 'SUI') {
        coinType = '0x2::sui::SUI';
      }

      // Get all coins of the source token type
      const allCoins = await suiClient.getCoins({
        owner: params.userAddress,
        coinType,
      });

      if (!allCoins.data || allCoins.data.length === 0) {
        throw new Error(`No ${params.sourceToken} coins found`);
      }

      // Calculate amounts using actual decimals
      const amountInWei = parseSuiAmount(params.amount, sourceDecimals);
      const minAmountOutWei = parseSuiAmount(params.minAmountOut, destDecimals);
      
      console.log(`Amount in (${params.amount} ${params.sourceToken}):`, amountInWei);
      console.log(`Min amount out (${params.minAmountOut} ${params.destToken}):`, minAmountOutWei);

      // Check total balance
      const totalBalance = allCoins.data.reduce(
        (sum, coin) => sum + Number(coin.balance),
        0
      );

      if (totalBalance < Number(amountInWei)) {
        throw new Error('Insufficient balance');
      }

      // Merge coins if needed
      const [mainCoin, ...restCoins] = allCoins.data;
      if (restCoins.length > 0 && params.sourceToken !== 'SUI') {
        tx.mergeCoins(
          tx.object(mainCoin.coinObjectId),
          restCoins.map((coin) => tx.object(coin.coinObjectId))
        );
      }

      // Split the required amount
      let coinToUse;
      if (params.sourceToken === 'SUI') {
        [coinToUse] = tx.splitCoins(tx.gas, [amountInWei]);
      } else {
        [coinToUse] = tx.splitCoins(mainCoin.coinObjectId, [amountInWei]);
      }

      // Calculate expiration timestamp
      const expirationMs = Date.now() + parseInt(params.deadline) * 60 * 1000;

      // Create ChainType objects using the contract helper function
      const sourceChainType = tx.moveCall({
        target: `${SUI_CONTRACTS.TESTNET.PACKAGE_ID}::intent_rfq::create_chain_type`,
        arguments: [tx.pure.u8(CHAIN_TYPES.SUI)]
      });

      const destChainType = tx.moveCall({
        target: `${SUI_CONTRACTS.TESTNET.PACKAGE_ID}::intent_rfq::create_chain_type`,
        arguments: [tx.pure.u8(CHAIN_TYPES.SUI)]
      });

      // Create intent order on SUI using the actual contract function
      // create_order<T>(intent_rfq, registry, source_type, source_chain_id, payment, dest_type, dest_chain_id, min_amount_out, resolver, ctx)
      tx.moveCall({
        target: `${SUI_CONTRACTS.TESTNET.PACKAGE_ID}::intent_rfq::create_order`,
        typeArguments: [sourceTokenInfo.type],
        arguments: [
          tx.object(SUI_CONTRACTS.TESTNET.INTENT_RFQ), // intent_rfq
          tx.object(SUI_CONTRACTS.TESTNET.RESOLVER_REGISTRY), // registry
          sourceChainType, // source_type (ChainType)
          tx.pure.u64(0), // source_chain_id (0 for SUI testnet)
          coinToUse, // payment (Coin<T>)
          destChainType, // dest_type (ChainType)
          tx.pure.u64(0), // dest_chain_id (0 for SUI testnet)
          tx.pure.u64(minAmountOutWei), // min_amount_out
          tx.pure.address(SUI_CONTRACTS.TESTNET.RESOLVER_ADDRESS) // resolver
        ],
      });

      console.log('Executing SUI transaction...');
      console.log('Transaction details:', {
        coinType,
        amountInWei,
        minAmountOutWei,
        resolverAddress: SUI_CONTRACTS.TESTNET.RESOLVER_ADDRESS,
        intentRfq: SUI_CONTRACTS.TESTNET.INTENT_RFQ
      });

      // Execute transaction using the dapp-kit mutation
      return new Promise((resolve, reject) => {
        signAndExecuteTransaction(
          {
            transaction: tx,
            options: {
              showEffects: true,
              showEvents: true,
              showObjectChanges: true
            },
          },
          {
            onSuccess: async (result: any) => {
              try {
                console.log('SUI transaction result:', result);

                if (!result || !result.digest) {
                  throw new Error('Transaction failed');
                }

                // Extract intent ID from events
                let intentId = result.digest; // fallback to using digest as ID
                
                if (result.events) {
                  const intentEvent = result.events.find((event: any) => 
                    event.type.includes('OrderCreated')
                  );
                  if (intentEvent && intentEvent.parsedJson) {
                    intentId = intentEvent.parsedJson.intent_id || intentId;
                    console.log('Found OrderCreated event:', intentEvent.parsedJson);
                  }
                }

                console.log('Intent ID:', intentId);

                // Save to database
                await saveSuiOrderToDatabase({
                  ...params,
                  intentId,
                  txHash: result.digest,
                  sourceTokenInfo: { ...sourceTokenInfo, decimals: sourceDecimals },
                  destTokenInfo: { ...destTokenInfo, decimals: destDecimals },
                  amountInWei,
                  minAmountOutWei
                });

                setState('success');
                console.log('SUI order created successfully');

                resolve({
                  success: true,
                  intentId,
                  txHash: result.digest,
                  result
                });
              } catch (error: any) {
                console.error('Error processing SUI transaction result:', error);
                setState('idle');
                reject(new Error(`Failed to process transaction: ${error.message}`));
              }
            },
            onError: (error: any) => {
              console.error('SUI transaction failed:', error);
              setState('idle');
              reject(new Error(`Transaction failed: ${error.message || 'Unknown error'}`));
            }
          }
        );
      });

    } catch (error: any) {
      console.error('Error creating SUI intent order:', error);
      setState('idle');
      throw new Error(`SUI order creation failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveSuiOrderToDatabase = async (data: any) => {
    console.log('Saving SUI order to database...');

    // Ensure user record exists
    const user = await userAPI.getOrCreateUser(
      data.userAddress.toLowerCase(),
      1, // SUI chain type
      0  // No specific chain ID for SUI
    );

    // Get resolver (first one from list)
    const resolvers = await resolverAPI.getAllResolvers();
    if (!resolvers || resolvers.length === 0) {
      throw new Error('No resolvers available');
    }
    const resolver = resolvers[0];

    // Prepare order data for database
    const orderData = {
      id: data.intentId,
      intentId: data.intentId,
      userId: user.id,
      resolverId: resolver.id,
      sourceChainType: 1, // SUI
      sourceChainId: 0,
      sourceTokenAddress: data.sourceTokenInfo.type,
      sourceTokenSymbol: data.sourceToken,
      sourceTokenDecimals: data.sourceTokenInfo.decimals,
      amountIn: data.amountInWei,
      destChainType: 1, // SUI (same chain for now)
      destChainId: 0,
      destTokenAddress: data.destTokenInfo.type,
      destTokenSymbol: data.destToken,
      destTokenDecimals: data.destTokenInfo.decimals,
      minAmountOut: data.minAmountOutWei,
      status: 'PENDING' as const,
      txHashSource: data.txHash,
      blockNumberSource: 0,
      expiresAt: new Date(Date.now() + parseInt(data.deadline) * 60 * 1000).toISOString(),
      retryCount: 0,
      ...(data.condition && {
        executionCondition: JSON.stringify({ condition: data.condition })
      })
    };

    console.log('SUI order data to save:', orderData);

    const savedOrder = await orderAPI.createOrder(orderData);
    console.log('SUI order saved successfully:', savedOrder);

    return savedOrder;
  };

  return {
    createSuiIntentOrder,
    isSubmitting,
    state
  };
}
