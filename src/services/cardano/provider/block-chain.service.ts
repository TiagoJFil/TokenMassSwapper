import { Inject, Injectable } from '@nestjs/common';
import { NESTJS } from 'src/utils/constants';
import {
  BlockFrostAPI,
  BlockfrostServerError,
} from '@blockfrost/blockfrost-js';
import { BlockFrostConfig, UTXO } from './blockfrost/BlockFrostConfig';
import { composeTransaction, signTransaction } from './blockfrost/helpers';
import { CardanoUtils } from '../utils';
import { AssetInfo } from '../../types';

@Injectable()
export class BlockChainService {
  private API: BlockFrostAPI;

  constructor(
    @Inject(NESTJS.BLOCKFROST_CONFIG_PROVIDER_KEY)
    blockFrostConfig: BlockFrostConfig,
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
    console.log(assetInfo);
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

  /**
   * Sends Ada from sender to receiver
   * @param senderSignKey
   * @param senderAddress
   * @param receiverAddress
   * @param amount
   */
  async sendCardano(senderSignKey, senderAddress, receiverAddress, amount) {
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
      //make an custom exception that will be caught by the controller
      throw new Error('No funds to send a transaction');
    }

    const latestBlock = await this.API.blocksLatest();
    const currentSlot = latestBlock.slot;
    if (!currentSlot) {
      throw Error('Failed to fetch slot number'); // This should never happen
    }

    // Prepare transaction
    const { txBody } = composeTransaction(
      senderAddress,
      receiverAddress,
      amount,
      utxo,
      {
        protocolParams,
        currentSlot,
      },
    );
    // Sign transaction
    const transaction = signTransaction(txBody, senderSignKey);

    // Push transaction to network
    try {
      // txSubmit endpoint returns transaction hash on successful submit
      const txHash = await this.API.txSubmit(transaction.to_bytes());

      // Before the tx is included in a block it is a waiting room known as mempool
      // Retrieve transaction from Blockfrost Mempool
      const mempoolTx = await this.API.mempoolTx(txHash);
      console.log('Mempool Tx:');
      console.log(JSON.stringify(mempoolTx, undefined, 4));

      console.log(`Transaction successfully submitted: ${txHash}\n`);
    } catch (error) {
      // submit could fail if the transactions is rejected by cardano node
      if (error instanceof BlockfrostServerError && error.status_code === 400) {
        console.log(`Transaction rejected`);
        // Reason for the rejection is in error.message
        console.log(error.message);
      } else {
        // rethrow other errors
        throw error;
      }
    }
  }
}