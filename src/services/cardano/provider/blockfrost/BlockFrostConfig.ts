import { Responses } from "@blockfrost/blockfrost-js";


export class BlockFrostConfig {
        apiKey: string;
        network: 'mainnet' | 'preview' | 'preprod' | 'sanchonet';
        constructor(apiKey: string, network: 'mainnet' | 'preview' | 'preprod' | 'sanchonet') {
            this.apiKey = apiKey;
            this.network = network
        }
    }
export interface AssetAmount {
    unit: string;
    quantity: string;
    }
export type UTXO = Responses['address_utxo_content'];