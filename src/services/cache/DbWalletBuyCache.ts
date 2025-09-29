import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BuyWeightsCache } from '../../model/entities/buy-weights-cache.entity';
import { CARDANO } from '../../utils/constants';

@Injectable()
export class DbWalletBuyCache {
  constructor(
    @InjectRepository(BuyWeightsCache)
    private buyWeightsCacheRepository: Repository<BuyWeightsCache>,
  ) {}

  async setCacheBuyAmount(walletAddress: string, amount: number): Promise<void> {
    // Subtract INDIVIDUAL_WALLET_MIN_BALANCE to ensure wallet keeps minimum required balance
    const buyAmount = Math.max(0, amount - CARDANO.INDIVIDUAL_WALLET_MIN_BALANCE);
    
    // Check if entry already exists
    const existingCache = await this.buyWeightsCacheRepository.findOne({
      where: { replicaWallet: { address: walletAddress } },
    });

    if (existingCache) {
      // Update existing record
      existingCache.buyAmount = buyAmount;
      existingCache.updatedAt = new Date();
      await this.buyWeightsCacheRepository.save(existingCache);
    } else {
      // Create new record
      const newCache = new BuyWeightsCache();
      newCache.replicaWalletAddress = walletAddress;
      newCache.buyAmount = buyAmount;
      await this.buyWeightsCacheRepository.save(newCache);
    }
  }

  async getCachedBuyAmount(walletAddress: string): Promise<number | null> {
    const cacheEntry = await this.buyWeightsCacheRepository.findOne({
      where: { replicaWallet: { address: walletAddress } },
    });

    return cacheEntry ? cacheEntry.buyAmount : null;
  }

  async getCachedBuyAmounts(walletAddresses: string[]): Promise<Map<string, number>> {
    // Query by wallet addresses
    const cacheEntries = await this.buyWeightsCacheRepository
      .createQueryBuilder('cache')
      .innerJoinAndSelect('cache.replicaWallet', 'wallet')
      .where('wallet.address IN (:...addresses)', { addresses: walletAddresses })
      .getMany();

    const resultMap = new Map<string, number>();
    
    cacheEntries.forEach(entry => {
      // We need to get the address from the relation
      resultMap.set(entry.replicaWallet.address, entry.buyAmount);
    });

    return resultMap;
  }
}
