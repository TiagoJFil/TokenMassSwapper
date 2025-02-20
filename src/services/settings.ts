import { ENV} from "../utils/constants";



enum Networks {
    MAINNET = "mainnet",
    TESTNET = "testnet"
}

export class Network {
    
    private current: string | null = null;

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
        if(process.env[ENV.IS_MAINNET]) {
            this.current = Networks.MAINNET
            return Networks.MAINNET
        }
        else{
            this.current = Networks.TESTNET
            return Networks.TESTNET
        }

        
    }

    public selected = this.current != null ? this.current : this.getNetworkFromEnv()

    public isMainnet(): boolean {
        return this.selected === Networks.MAINNET
    }

    public isTestnet(): boolean {
        return this.selected === Networks.TESTNET
    }

}



