import { HTTPClient } from "./http-client";
import { DexAPI } from "./dex"
import { BridgeAPI } from "./bridge"
// import type { OKXConfig } from "../types";

export class OKXDexClient {
    private config: any;
    private httpClient: HTTPClient;
    public dex: DexAPI;
    public bridge: BridgeAPI;

    constructor(config: any) {
        this.config = {
            baseUrl: "https://web3.okx.com",
            maxRetries: 3,
            timeout: 30000,
            ...config,
        };

        this.httpClient = new HTTPClient(this.config);
        this.dex = new DexAPI(this.httpClient, this.config);
        this.bridge = new BridgeAPI(this.httpClient);
    }
}
