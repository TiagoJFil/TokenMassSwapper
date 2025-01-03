import { __decorate, __metadata, __param } from "tslib";
import { Indexer, Inscription } from 'KasplexBuilder';
import express from 'express';
import { API, NESTJS } from '../../utils/constants';
import { KRC20BalanceDTO } from '../dtos/KRC20/KRC20BalanceDTO';
import { requireTickerValid } from '../../utils/validation';
import { KRC20TokenInfoDTO, KRC20TokenState } from '../dtos/KRC20/KRC20TokenInfoDTO';
import { checkKRC20TokenState, parseDecimals } from '../../utils/utils';
import { ScriptBuilder, XOnlyPublicKey, addressFromScriptPublicKey } from '../../wasm';
import { TokenFullyMintedException, TokenNotMintableException } from '../exceptions';
import { Address } from '../../wasm/kaspa';
import { Network } from '../settings';
import { Inject, Injectable } from "@nestjs/common";
import { TestnetIndexer } from "./Indexers.ts";
let KasplexService = class KasplexService {
    indexer;
    constructor(indexer) {
        this.indexer = indexer;
    }
    async getKRC20Balances(address) {
        try {
            const balances = await this.indexer.getKRC20Balances({
                address: address
            });
            console.log(balances);
            return balances;
        }
        catch (err) {
            console.error(err);
            throw new Error("Addres Not found");
        }
    }
};
KasplexService = __decorate([
    Injectable(),
    __param(0, Inject(NESTJS.INDEXER_PROVIDER_KEY)),
    __metadata("design:paramtypes", [Indexer])
], KasplexService);
export { KasplexService };
export var ScriptAction;
(function (ScriptAction) {
    ScriptAction["MINT"] = "mint";
    ScriptAction["TRANSFER"] = "transfer";
})(ScriptAction || (ScriptAction = {}));
/*
function prepareKRC20Script(script: ScriptBuilder,ticker: string, amount: number, decimals : number, wallet: string, action: ScriptAction): Inscription<ScriptAction> {
   
        
        const amt = BigInt(amount * Math.pow(10, decimals)).toString()
        const inscriptObj = {
            tick: ticker,
            to: recipient.toString()
        }
        if(action === ScriptAction.TRANSFER) {
            inscriptObj.amt = BigInt(amt).toString()
        }
        const inscription = new Inscription(action, inscriptObj)
        inscription.write(script, XOnlyPublicKey.fromAddress(new Address(wallet)).toString())
        return inscription
}

*/ 
