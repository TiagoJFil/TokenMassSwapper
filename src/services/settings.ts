import { API } from "../utils/constants";
import { NetworkType } from "../wasm/kaspa";



enum Networks {
    MAINNET = "mainnet",
    TESTNET = "testnet"
}

export class Network {
    
    selected: string | null = null;

    //singleton
    private static instance: Network;
    private constructor() {}

    public static getInstance(): Network {
        if (!Network.instance) {
            Network.instance = new Network()
        }
        return Network.instance
    }

    getNetworkFromEnv(): string {
        switch(process.env["NETWORK_SELECTED"]) {
            case Networks.MAINNET:
                this.selected = Networks.MAINNET
                return Networks.MAINNET
            case Networks.TESTNET:
                this.selected = Networks.TESTNET
                return Networks.TESTNET
            default:
                this.selected = Networks.TESTNET
                return Networks.TESTNET
        }
        
    }

    public current = this.selected != null ? this.selected : this.getNetworkFromEnv()

    public getKasplexUrl(): string {
        switch(this.current) {
            case Networks.MAINNET:
                return API.MAINNET.KASPLEX
            case Networks.TESTNET:
                return API.TESTNET.KASPLEX
        }
        return API.TESTNET.KASPLEX
    }

    public getKaspaUrl(): string {
        switch(this.current) {
            case Networks.MAINNET:
                return API.MAINNET.KASPA
            case Networks.TESTNET:
                return API.TESTNET.KASPA
        }
        return API.TESTNET.KASPA
    }

    public getKasplexNetworkType(): NetworkType {
        switch(this.current) {
            case Networks.MAINNET:
                return NetworkType.Mainnet
            case Networks.TESTNET:
                return NetworkType.Testnet
        }
        return NetworkType.Testnet
    }

}



