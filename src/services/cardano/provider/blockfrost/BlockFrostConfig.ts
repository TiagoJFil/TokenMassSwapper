import { Responses } from "@blockfrost/blockfrost-js";
import { CardanoNetwork } from "@blockfrost/blockfrost-js/lib/types";

export class BlockFrostConfig {
        apiKey: string;
        network: CardanoNetwork;
        constructor(apiKey: string, network: CardanoNetwork) {
            this.apiKey = apiKey;
            this.network = network
        }
    }
export interface AssetAmount {
    unit: string;
    quantity: string;
    }
export type UTXO = Responses['address_utxo_content'];