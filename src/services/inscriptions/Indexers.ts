
import {API, NESTJS} from "../../utils/constants";
import {Injectable, Module, type Provider} from "@nestjs/common";
import {Indexer} from "../kasplexAPIUtils/indexer/indexer";
import {Network} from "../settings";

@Injectable()
export class MainnetIndexer extends Indexer {
    constructor () {
        super(API.MAINNET.KASPLEX)
    }
}

@Injectable()
export class TestnetIndexer extends Indexer {
    constructor () {
        super(API.TESTNET.KASPLEX)
    }
}

export const IndexerProvider: Provider = {
    provide: NESTJS.INDEXER_PROVIDER_KEY,
    useFactory: () => {
        return Network.getInstance().isMainnet() ? new MainnetIndexer() : new TestnetIndexer();
    },
};

@Module({
    imports: [],
    controllers: [],
    providers: [IndexerProvider, MainnetIndexer,TestnetIndexer],
    exports: [IndexerProvider],
})
export class IndexerModule {}

