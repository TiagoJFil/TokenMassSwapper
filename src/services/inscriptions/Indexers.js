import { __decorate, __metadata } from "tslib";
import { Indexer } from "KasplexBuilder";
import { API, NESTJS } from "../../utils/constants.ts";
import { Injectable, Module } from "@nestjs/common";
export class MainnetIndexer extends Indexer {
    constructor() {
        super(API.MAINNET.KASPLEX);
    }
}
let TestnetIndexer = class TestnetIndexer extends Indexer {
    constructor() {
        super(API.TESTNET.KASPLEX);
    }
};
TestnetIndexer = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [])
], TestnetIndexer);
export { TestnetIndexer };
export const IndexerProvider = {
    provide: NESTJS.INDEXER_PROVIDER_KEY,
    useFactory: () => {
        return process.env["IS_MAIN_NET"] === 'true' ? new MainnetIndexer() : new TestnetIndexer();
    },
};
let IndexerModule = class IndexerModule {
};
IndexerModule = __decorate([
    Module({
        imports: [],
        controllers: [],
        providers: [IndexerProvider, MainnetIndexer, TestnetIndexer],
        exports: [IndexerProvider],
    })
], IndexerModule);
export { IndexerModule };
