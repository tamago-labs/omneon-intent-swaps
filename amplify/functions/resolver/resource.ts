import { defineFunction } from "@aws-amplify/backend";
import { secret } from '@aws-amplify/backend';

export const resolverScheduler = defineFunction({
    name: "resolver-scheduler",
    schedule: "every 5m",
    timeoutSeconds: 300, // 5 minutes 
    memoryMB: 1024,
    environment: {
        // OKX API credentials
        OKX_API_KEY: secret("OKX_API_KEY"),
        OKX_SECRET_KEY: secret("OKX_SECRET_KEY"),
        OKX_API_PASSPHRASE: secret("OKX_API_PASSPHRASE"),
        OKX_PROJECT_ID: secret("OKX_PROJECT_ID"),
        
        // EVM Configuration
        EVM_RPC_URL: secret("EVM_RPC_URL"),
        EVM_RESOLVER_PRIVATE_KEY: secret("EVM_RESOLVER_PRIVATE_KEY"),
        EVM_RESOLVER_ADDRESS: secret("EVM_RESOLVER_ADDRESS"),
        
        // SUI Configuration
        SUI_RPC_URL: secret("SUI_RPC_URL"),
        SUI_RESOLVER_PRIVATE_KEY: secret("SUI_RESOLVER_PRIVATE_KEY"),
        SUI_RESOLVER_ADDRESS: secret("SUI_RESOLVER_ADDRESS"),
    },
});
