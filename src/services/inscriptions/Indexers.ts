import {Indexer} from "KasplexBuilder";
import {API, NESTJS} from "../../utils/constants.ts";
import {Injectable, Module, type Provider} from "@nestjs/common";

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
        return process.env["IS_MAIN_NET"] === 'true' ? new MainnetIndexer() : new TestnetIndexer();
    },
};

@Module({
    imports: [],
    controllers: [],
    providers: [IndexerProvider, MainnetIndexer,TestnetIndexer],
    exports: [IndexerProvider ],
})
export class IndexerModule {}

