import type { EventBridgeHandler } from "aws-lambda";
import type { Schema } from '../../data/resource';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { env } from '$amplify/env/resolver-scheduler';

import { ResolverOrchestrator } from './src/resolver-orchestrator';

// Initialize Amplify client
const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);
const client = generateClient<Schema>();
Amplify.configure(resourceConfig, libraryOptions);

export const handler: EventBridgeHandler<"Scheduled Event", null, void> = async (event) => {
  console.log("🚀 Resolver Lambda triggered:", JSON.stringify(event, null, 2));
  console.log("Timestamp:", new Date().toISOString());

  const orchestrator = new ResolverOrchestrator();
  await orchestrator.processAllPendingOrders();
};
