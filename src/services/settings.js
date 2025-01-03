import { API } from "../utils/constants";
import { NetworkType } from "../wasm/kaspa";
var Networks;
(function (Networks) {
    Networks["MAINNET"] = "mainnet";
    Networks["TESTNET"] = "testnet";
})(Networks || (Networks = {}));
export class Network {
    selected = null;
    //singleton
    static instance;
    constructor() { }
    static getInstance() {
        if (!Network.instance) {
            Network.instance = new Network();
        }
        return Network.instance;
    }
    getNetworkFromEnv() {
        switch (process.env["NETWORK_SELECTED"]) {
            case Networks.MAINNET:
                this.selected = Networks.MAINNET;
                return Networks.MAINNET;
            case Networks.TESTNET:
                this.selected = Networks.TESTNET;
                return Networks.TESTNET;
            default:
                this.selected = Networks.TESTNET;
                return Networks.TESTNET;
        }
    }
    current = this.selected != null ? this.selected : this.getNetworkFromEnv();
    getKasplexUrl() {
        switch (this.current) {
            case Networks.MAINNET:
                return API.MAINNET.KASPLEX;
            case Networks.TESTNET:
                return API.TESTNET.KASPLEX;
        }
        return API.TESTNET.KASPLEX;
    }
    getKaspaUrl() {
        switch (this.current) {
            case Networks.MAINNET:
                return API.MAINNET.KASPA;
            case Networks.TESTNET:
                return API.TESTNET.KASPA;
        }
        return API.TESTNET.KASPA;
    }
    getKasplexNetworkType() {
        switch (this.current) {
            case Networks.MAINNET:
                return NetworkType.Mainnet;
            case Networks.TESTNET:
                return NetworkType.Testnet;
        }
        return NetworkType.Testnet;
    }
}
