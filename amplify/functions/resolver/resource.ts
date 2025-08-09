import { defineFunction } from "@aws-amplify/backend";
import { secret } from '@aws-amplify/backend';

export const resolverScheduler = defineFunction({
    name: "resolver-scheduler",
    schedule: "every 10m",
    timeoutSeconds: 300, // 5 minutes 
    memoryMB: 1024,
    environment: {
        // Optional: API keys for price feeds or other services
        // OKX_API_KEY: secret("OKX_API_KEY"),
        // OKX_SECRET_KEY: secret("OKX_SECRET_KEY"),
        // OKX_API_PASSPHRASE: secret("OKX_API_PASSPHRASE"),
        // OKX_PROJECT_ID: secret("OKX_PROJECT_ID")
        
        // For production, uncomment these when implementing real transfers:
        // EVM_RESOLVER_PRIVATE_KEY: secret("EVM_RESOLVER_PRIVATE_KEY"),
        // SUI_RESOLVER_PRIVATE_KEY: secret("SUI_RESOLVER_PRIVATE_KEY"),
    },
});
