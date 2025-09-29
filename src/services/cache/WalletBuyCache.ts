import { Injectable } from '@nestjs/common';
import { DbWalletBuyCache } from './DbWalletBuyCache';

@Injectable()
export class WalletBuyCache {
  constructor(
    private dbWalletBuyCache: DbWalletBuyCache,
  ) {}

  async setCacheBuyAmount(walletAddress: string, amount: number): Promise<void> {
    await this.dbWalletBuyCache.setCacheBuyAmount(walletAddress, amount);
  }

  async getCachedBuyAmount(walletAddress: string): Promise<number | null> {
    return await this.dbWalletBuyCache.getCachedBuyAmount(walletAddress);
  }

  async getCachedBuyAmounts(walletAddresses: string[]): Promise<Map<string, number>> {
    return await this.dbWalletBuyCache.getCachedBuyAmounts(walletAddresses);
  }
}
