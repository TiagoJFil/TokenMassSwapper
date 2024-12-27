import { Indexer } from 'KasplexBuilder'
import { AppDataSource } from './src/model/database/database.providers'
import express from 'express'
import cors from 'cors'
import { API } from '../../utils/constants'
import type { KRC20BalancesResponse, KRC20InfoResponse } from 'KasplexBuilder/src/indexer/protocol'
import { KRC20BalanceDTO } from '../dtos/KRC20/KRC20BalanceDTO'
import { requireTickerValid } from '../../utils/validation'
import { KRC20TokenInfoDTO, KRC20TokenState } from '../dtos/KRC20/KRC20TokenInfoDTO'
import { checkKRC20TokenState, parseDecimals } from '../../utils/utils'
import { ScriptBuilder, XOnlyPublicKey, addressFromScriptPublicKey } from '../../wasm'
import { Inscription } from 'KasplexBuilder'
import { TokenFullyMintedException, TokenNotMintableException } from '../exceptions'
import { Address } from '../../wasm/kaspa'
import { Network } from '../../settings'




export class KasplexService {
    private static instance: KasplexService
    private indexer: Indexer

    private constructor(ind: Indexer) {
        this.indexer = ind
    }
    
    public static getInstance(): KasplexService {
        if (!KasplexService.instance) {
            const indexer = new Indexer(API.MAINNET.KASPLEX)
            KasplexService.instance = new KasplexService(indexer)
        }
        return KasplexService.instance
    }
    
    async getKRC20Balances(address: string): Promise<KRC20BalancesResponse> {
        try {
            const balances = await this.indexer.getKRC20Balances({
                address: address
            })
            return balances
        }
        catch(err) {
            console.error(err)
            throw new Error("Addres Not found")
        }
    } 

    async getKRC20TickerInfo(ticker: string): Promise<KRC20TokenInfoDTO> {
        requireTickerValid(ticker)
        try {
            const info = await this.indexer.getKRC20Info({
                tick: ticker
            })
            const infoObj = info.result[0]
            if(!infoObj) {
                throw new Error("Ticker Not found")
            }
            
            const tokenInfoDTO = new KRC20TokenInfoDTO(
                infoObj.tick,
                parseDecimals(infoObj.max, infoObj.dec), 
                parseDecimals(infoObj.lim, infoObj.dec),
                parseDecimals(infoObj.pre, infoObj.dec),
                infoObj.dec, 
                parseDecimals(infoObj.minted, infoObj.dec), 
                infoObj.state)

            return tokenInfoDTO
        }catch(err) {
            console.error(err)
            throw new Error("Ticker Not found")
        }
    }

    async getKRC20WalletBalance(address: string, ticker: string): Promise<KRC20BalanceDTO> {
        requireTickerValid(ticker)
        try {
            const balances = await this.indexer.getKRC20Balance({
                address: address,
                tick: ticker
            })

            const info = balances.result[0]
            if(!info) {
                throw new Error("Ticker Not found")
            }
            //balnce with dec caclution
            const tokenBalanceDTO = new KRC20BalanceDTO(info.tick,parseDecimals(info.balance,info.dec))
                
            return tokenBalanceDTO
        }catch(err) {
            console.error(err)
            throw new Error("Ticker Not found")
        }
    }

    async getKRC20WalletBalances(address: string): Promise<KRC20BalanceDTO[]> {
        try {
            const balances = await this.indexer.getKRC20Balances({
                address: address
            })

            if(!balances.result[0]) {
                return []
            }
            const balancesDTO = balances.result.map((holder) => {
                return new KRC20BalanceDTO(holder.tick, parseDecimals(holder.balance, holder.dec))
            })
            return balancesDTO
        }
        catch(err) {
            console.error(err)
            throw new Error("Address Not found")
        }
    }

    


    async mintKRC20Token(wallet: string, privateKey: string, ticker: string, amount: number): Promise<Inscription> {
        const tokenInfo = await this.getKRC20TickerInfo(ticker)
        checkKRC20TokenState(tokenInfo.state)
        const script = new ScriptBuilder()
    
        prepareKRC20Script(script , ticker, amount, tokenInfo.decimals, wallet, ScriptAction.MINT)
        
        
        const commitAddress = addressFromScriptPublicKey(script.createPayToScriptHashScript(), Network.getInstance().getKasplexNetworkType())!
        commitAddress.
        const signature = transaction.createInputSignature(0, privateKey)
        transaction.fillInput(0, script.encodePayToScriptHashSignatureScript(signature))  

    }
    
}

export enum ScriptAction {
    MINT = "mint",
    TRANSFER = "transfer"
}

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

