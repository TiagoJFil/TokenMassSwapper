import { Inject, Injectable } from '@nestjs/common';
import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
import { NESTJS } from '../../../../utils/constants';
import { BlockFrostConfig } from '../blockfrost/BlockFrostConfig';

@Injectable()
export class BlockFrostTxSubmitterService implements TxSubmitter {
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
  async submitTx(transaction): Promise<string> {
    return await this.API.txSubmit(transaction);
  }
}