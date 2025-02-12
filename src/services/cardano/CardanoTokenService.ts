import { DexHunterService } from './provider/DexHunterService';
import { BlockChainService } from './provider/block-chain.service';
import { Injectable } from '@nestjs/common';
import { BlockfrostServerError } from '@blockfrost/blockfrost-js';

@Injectable()
export class CardanoTokenService {
  constructor(
    private tokenService: DexHunterService,
    private chainService: BlockChainService
  ) {}

  private async getCardanoTokenMetadata(assetId: string): Promise<AssetInfo> {
    //TODO: cache with db
    const assetInfo = await this.chainService.getTokenMetadata(assetId);
    return assetInfo;
  }

  async getTokenBalances(walletAddy) {
    const assetBalances = await this.chainService.getCardanoTokenBalances(walletAddy);
    console.log(assetBalances)
    const tokenBalances = assetBalances.map(async (asset) => {
      const tokenInfo = await this.getCardanoTokenMetadata(asset.unit);
      if (tokenInfo === null) {
        return null;
      }
      return {
        policyId: tokenInfo.policyId,
        assetName: tokenInfo.assetName,
        ticker: tokenInfo.ticker,
        quantity: asset.quantity,
      };
    }).filter((asset) => asset !== null);

    return tokenBalances;
  }

  async getAdaBalance(walletAddy) {
    return await this.chainService.getAdaBalance(walletAddy);
  }


  async getTokenPrice(ticker) {
    throw new Error('Not implemented, not necessary now');
  }

  async buyToken(walletAddy, ticker, amount) {
    // Implement the logic to buy token here
    
  }

  async sellToken(walletAddy, ticker, amount) {
    // Implement the logic to sell token here
  }
}


