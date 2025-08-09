import { defineFunction } from "@aws-amplify/backend";
import { secret } from '@aws-amplify/backend';

export const resolverScheduler = defineFunction({
    name: "resolver-scheduler",
    schedule: "every 10m",
    timeoutSeconds: 300, // 5 minutes 
    memoryMB: 1024,
    environment: {
        OKX_API_KEY: secret("OKX_API_KEY"),
        OKX_SECRET_KEY: secret("OKX_SECRET_KEY"),
        OKX_API_PASSPHRASE: secret("OKX_API_PASSPHRASE"),
        OKX_PROJECT_ID: secret("OKX_PROJECT_ID")
    },
});