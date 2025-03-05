import { Inject, Injectable } from '@nestjs/common';
import { NESTJS } from 'src/utils/constants';
import {
  BlockFrostAPI,
  BlockfrostServerError,
} from '@blockfrost/blockfrost-js';
import { BlockFrostConfig, UTXO } from './blockfrost/BlockFrostConfig';
import { composeTransaction, signTransaction } from './blockfrost/helpers';
import { CardanoUtils } from '../utils';
import { AdaSendInfo, AssetInfo, OutputTxInfo } from '../../types';

@Injectable()
export class BlockChainService {
  private API: BlockFrostAPI;
  constructor(
    @Inject(NESTJS.BLOCKFROST_CONFIG_PROVIDER_KEY)
    blockFrostConfig: BlockFrostConfig,
    @Inject(NESTJS.TX_SUBMITTER_PROVIDER_KEY)
    private readonly txSubmitter : TxSubmitter
  ) {
    this.API = new BlockFrostAPI({
      projectId: blockFrostConfig.apiKey,
      network: blockFrostConfig.network,
    });
  }

  async getCardanoTokenBalances(stakeKey) {
    let res;
    try {
      res = await this.API.accountsAddressesAssetsAll(stakeKey);
    } catch (e: any) {
      if (e instanceof BlockfrostServerError && e.status_code == 404) {
        return [];
      } else {
        throw e;
      }
    }
    return res;
  }

  async getTokenMetadata(assetId) : Promise<AssetInfo> {
    const assetInfo = await this.API.assetsById(assetId);
    if (!assetInfo) {
      throw new Error('Asset not found');
    }
    if (assetInfo.onchain_metadata_standard === 'CIP25v2' || assetInfo.onchain_metadata_standard === 'CIP25v1') {

      return {
        assetId: assetInfo.asset,
        policyId: assetInfo.policy_id,
        assetName: String(assetInfo.onchain_metadata["name"]),
        ticker: String(assetInfo.onchain_metadata["ticker"]),
      }
    }else{
      //NFT probably
      //TODO see if error makes sense as it is costly
      return null;
    }

  }

  async getAdaBalance(walletAddress) {
    let res;
    try {
      res = await this.API.addresses(walletAddress);
    } catch (e: any) {
      if (e instanceof BlockfrostServerError && e.status_code == 404) {
        return 0;
      } else {
        throw e;
      }
    }
    const lovelaceBalance = res.amount.filter(
      (asset) => asset.unit === 'lovelace',
    )[0].quantity;
    return CardanoUtils.toAda(lovelaceBalance);
    // Implement the logic to get ADA balance here
  }

  async getWalletBalances(walletAddress) {
    let allWalletAssetsInfo : {
      address: string;
      amount: { unit: string; quantity: string }[];
      stake_address: string | null;
      type: "byron" | "shelley";
      script: boolean
    };
    try {
      allWalletAssetsInfo = await this.API.addresses(walletAddress);
    } catch (e: any) {
      if (e instanceof BlockfrostServerError && e.status_code == 404) {
        return {
          adaBal: 0,
          tokens: []
        };
      } else {
        throw e;
      }
    }
    const lovelaceBalance = allWalletAssetsInfo.amount.find(
      (asset) => asset.unit === 'lovelace',
    ).quantity;
    const adaBal = CardanoUtils.toAda(lovelaceBalance);
    const tokensInfo = allWalletAssetsInfo.amount.filter(
      (asset) => asset.unit !== 'lovelace'
    );

    return {
      adaBal,
      tokens: tokensInfo
    }
  }



  async fetchTransactionData( senderAddress) {
    const protocolParams = await this.API.epochsLatestParameters();

    let utxo: UTXO = [];
    try {
      utxo = await this.API.addressesUtxosAll(senderAddress);
    } catch (error) {
      if (error instanceof BlockfrostServerError && error.status_code === 404) {
        // Address derived from the seed was not used yet
        // In this case Blockfrost API will return 404
        utxo = [];
      } else {
        throw error;
      }
    }

    if (utxo.length === 0) {
      //TODO: make a custom exception that will be caught by the controller
      throw new Error('No funds to send a transaction');
    }

    const latestBlock = await this.API.blocksLatest();
    const currentSlot = latestBlock.slot;
    if (!currentSlot) {
      throw new Error('Failed to fetch slot number');
    }

    return { protocolParams, utxo, currentSlot };
  }

  /**
   * Sends Ada from sender to receiver
   * @param senderSignKey
   * @param senderAddress
   * @param sendInfo
   */
  async sendCardano(senderSignKey, senderAddress, sendInfo : AdaSendInfo | AdaSendInfo[] ) {
    if (!Array.isArray(sendInfo)) {
      sendInfo = [sendInfo];
    }
    const outputTxInfo : OutputTxInfo[] = sendInfo.map(
      (info) => {
        return {
          address: info.address,
          amount: info.amount,
          assetId: 'lovelace'
        }
      }
    )
    return await this.sendTransaction(senderSignKey, senderAddress, outputTxInfo);
  }

  async sendToken(senderSignKey, senderAddress, receiverAddress, amount:number, assetId) {
    await this.sendTransaction(senderSignKey, senderAddress, {address: receiverAddress, amount: amount, assetId: assetId});
  }

  private async sendTransaction(senderSignKey, senderAddress,  outputTxinfo : OutputTxInfo | OutputTxInfo[] ) {
    const { protocolParams, utxo, currentSlot } = await this.fetchTransactionData(senderAddress);

    if (!Array.isArray(outputTxinfo)) {
      outputTxinfo = [outputTxinfo];
    }
    // Prepare transaction
    const { txBody } = composeTransaction(
      senderAddress,
      utxo,
      {
        protocolParams,
        currentSlot,
      },
      outputTxinfo
    );
    // Sign transaction
    const transaction = signTransaction(txBody, senderSignKey);

    try {
      const txHash = await this.txSubmitter.submitTx(transaction.to_bytes());
      console.log(`Transaction hash: ${txHash}`);
      // Before the tx is included in a block it is a waiting room known as mempool
      // Retrieve transaction from Blockfrost Mempool
      const mempoolTx = await this.API.mempoolTx(txHash);
      console.log('Mempool Tx:');
      console.log(JSON.stringify(mempoolTx, undefined, 4));

      console.log(`Transaction successfully submitted: ${txHash}\n`);
      return txHash
    } catch (error) {
      // submit could fail if the transactions is rejected by cardano node
      if (error instanceof BlockfrostServerError && error.status_code === 400) {
        console.log(`Transaction rejected`);
        console.log(error.message);
      } else {
        throw error;
      }
    }
  }
}