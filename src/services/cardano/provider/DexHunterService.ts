import {
  DtoSwapObject,
  DtoSwapResponse,
  SwapApiFactory,
  SwapApiFactoryType,
} from './dexhunter/api';
import { Configuration } from './dexhunter/DexHunterSDK';
import FetchFetchApi from './dexhunter/fetchFetchApi';
import { Inject, Injectable } from '@nestjs/common';
import { CARDANO, NESTJS } from 'src/utils/constants';
import * as CardanoWasm from '@emurgo/cardano-serialization-lib-nodejs';
import {
  NotEnoughFunds,
  NotEnoughFundsDexHunterError,
  NoUtxFoundError,
} from '../../exceptions/exceptions';
import {
  composeTransaction,
  getSignaturesForCBOR,
  signTransactionFromCBOR,
  signTransaction,
} from './blockfrost/helpers';
import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
import { BlockFrostConfig } from './blockfrost/BlockFrostConfig';
import { txsCbor } from '@blockfrost/blockfrost-js/lib/endpoints/api/txs';

@Injectable()
export class DexHunterService {
  private chainApi: BlockFrostAPI;
  private swapApi: SwapApiFactoryType;

  constructor(
    @Inject(NESTJS.BLOCKFROST_CONFIG_PROVIDER_KEY)
    blockFrostConfig: BlockFrostConfig,
    @Inject(NESTJS.DEXHUNTER_CONFIG_PROVIDER_KEY)
    configuration: Configuration,
  ) {
    this.swapApi = SwapApiFactory(
      configuration,
      FetchFetchApi,
      configuration.basePath,
    );
    this.chainApi = new BlockFrostAPI({
      projectId: blockFrostConfig.apiKey,
      network: blockFrostConfig.network,
    });
  }



  private async executeSwap(swapPayload, signerPrivateKey, signerStakeKey) {
    const swap = await this.sendSwapRequest(swapPayload);
    const signatures = this.signSwapTransaction(swap,signerPrivateKey,signerStakeKey);
    const dexSignedTx = await this.requestSignedSwapTransaction(
      signatures,
      swap,
    );
    const txHashResult = await this.chainApi.txSubmit(dexSignedTx.cbor);
    //^^ need this to execute the transaction
    return swap;
  }

  async swapToken(
    addressToSend: string,
    signerPrivateKey: string,
    signerStakeKey: string,
    policyID: string,
    amount: number,
    slippage: number,
    action: SWAP
  ) {
    const swapPayload = this.buildSwapPayload(
      addressToSend,
      policyID,
      amount,
      slippage,
      action
    );

    return await this.executeSwap(
      swapPayload,
      signerPrivateKey,
      signerStakeKey,
    );
  }



  private buildSwapPayload(
    addressToSend: string,
    policyID: string,
    amount: number,
    slippage: number,
    action : SWAP
  ): DtoSwapObject {
    if (slippage < 0 || slippage > 1) {
      throw new Error('Slippage must be between 0 and 1');
    }
    if (amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }
    let tokenIn;
    let tokenOut;
    if(action === SWAP.BUY){
      tokenIn = CARDANO.ADA_POLICY_ID;
      tokenOut = policyID;
    }else{
      tokenIn = policyID;
      tokenOut = CARDANO.ADA_POLICY_ID;
    }

    return {
      buyer_address: addressToSend,
      amount_in: amount,
      token_in: tokenIn,
      token_out: tokenOut,
      tx_optimization: true,
      referrer: 'ParaSwap',
      blacklisted_dexes: [],
      slippage: slippage,
    };
  }

  private async sendSwapRequest(swapPayload: DtoSwapObject) {
    try {
      const res = await this.swapApi.swapBuildPost(swapPayload);
      return res;
    } catch (err) {
      console.log(err);
      console.error('Error sending swap request:', err.message);
      // if error contains utxo not found, throw custom error
      if (err.message.includes('UTxO not found')) {
        //TODO
        throw new NoUtxFoundError(swapPayload.buyer_address);
      }
      if (err.message.includes('not enough funds')) {
        throw new NotEnoughFundsDexHunterError(swapPayload.buyer_address);
      }
    }
  }

  private async requestSignedSwapTransaction(signatures, swap) {
    try {
      const sign = await this.swapApi.swapSignPost({
        txCbor: swap.cbor,
        signatures: signatures,
      });

      return sign;
    } catch (err) {
      console.error('Error submitting transaction:', err);
      throw new Error('Error submitting transaction');
    }
  }

  private signSwapTransaction = (swap, ...signerKeys: string[]) => {
    return getSignaturesForCBOR(swap.cbor, ...signerKeys);
  };


}

