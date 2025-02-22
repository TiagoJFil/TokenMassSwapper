import { Provider } from '@nestjs/common';
import { BlockFrostConfig } from 'src/services/cardano/provider/blockfrost/BlockFrostConfig';
import { Configuration } from 'src/services/cardano/provider/dexhunter/DexHunterSDK';
import { ENV, NESTJS } from 'src/utils/constants';
import { NotFoundEnvVarError } from '../services/exceptions/custom';
import { BlockFrostTxSubmitterService } from '../services/cardano/provider/node/blockfrost-tx-submitter.service';
import { NodeTxSubmitterService } from '../services/cardano/provider/node/node-tx-submitter.service';


export const DexhunterConfigProvider: Provider = {
  provide: NESTJS.DEXHUNTER_CONFIG_PROVIDER_KEY,
  useFactory: () => {
    const dexhunter_partner_id = process.env[ENV.DEXHUNTER_PARTNER_ID];
    const dexhunter_base_url = process.env[ENV.DEXHUNTER_API_BASE_URL];
    return new Configuration({
      partnerToken: dexhunter_partner_id,
      basePath: dexhunter_base_url,
    });
  },
};

export const CustomNodeEndpointProvider: Provider = {
  provide: NESTJS.CUSTOM_NODE_API_SUBMIT_TX_ENDPOINT,
  useFactory: () =>
  process.env[ENV.CUSTOM_NODE_API_SUBMIT_TX_ENDPOINT],
}

export const TxSubmitterProvider: Provider = {
  provide: NESTJS.TX_SUBMITTER_PROVIDER_KEY,
  inject: [NESTJS.CUSTOM_NODE_API_SUBMIT_TX_ENDPOINT, NESTJS.BLOCKFROST_CONFIG_PROVIDER_KEY],
  useFactory: (
    customNodeEndpoint: string,
    blockFrostAPI: BlockFrostConfig
  ) =>  {

    if(!process.env[ENV.CUSTOM_NODE_API_SUBMIT_TX_ENDPOINT]){
      return new BlockFrostTxSubmitterService(blockFrostAPI);
    }
    else {
      return new NodeTxSubmitterService(customNodeEndpoint);
    }
  }
}

export const BlockfrostConfigProvider: Provider = {
  provide: NESTJS.BLOCKFROST_CONFIG_PROVIDER_KEY,
  useFactory: () => {
    const blockfrost_api_key = process.env[ENV.BLOCKFROST_API_KEY];
    const is_blockfrost_mainnet = process.env[ENV.IS_MAINNET]
    if (is_blockfrost_mainnet == undefined) {
      throw new NotFoundEnvVarError(ENV.IS_MAINNET);
    }
    if (!blockfrost_api_key) {
      throw new NotFoundEnvVarError(ENV.BLOCKFROST_API_KEY);
    }
    let network;
    if (is_blockfrost_mainnet.toLowerCase() === "true") {
      network = 'mainnet';
    } else {
      network = 'preview';
    }
    return new BlockFrostConfig(blockfrost_api_key, network);
  },
};

export const NetworkProvider: Provider = {
  provide: NESTJS.IS_MAINNET_PROVIDER_KEY,
  useFactory: () => {
      return process.env[ENV.IS_MAINNET].toLowerCase() === "true";
  },
};
