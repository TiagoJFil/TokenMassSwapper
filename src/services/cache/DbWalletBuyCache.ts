import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BuyWeightsCache } from '../../model/entities/BuyWeightsCache';
import { WalletBuyCache } from './WalletBuyCache';
import { BuyWeightsCacheType } from '../types';

@Injectable()
export class DbWalletBuyCache implements WalletBuyCache {
  constructor(
    @InjectRepository(BuyWeightsCache)
    private readonly buyWeightsCacheRepository: Repository<BuyWeightsCache>,
  ) {}

  async hasCachedBuyWeights(userID: number): Promise<boolean> {
    const cache = await this.buyWeightsCacheRepository.findOne({ where: { userID } });
    return !!cache;
  }

  async invalidateCache(userID: number): Promise<void> {
    await this.buyWeightsCacheRepository.delete({ userID });
  }

  async addToCache(userId: number, cacheData: BuyWeightsCacheType): Promise<void> {
    const cache = new BuyWeightsCache();
    cache.userID = userId;
    cache.data = cacheData;
    await this.buyWeightsCacheRepository.save(cache);
  }

  async getCache(userID: number): Promise<any> {
    const cache = await this.buyWeightsCacheRepository.findOne({ where: { userID } });
    return cache ? cache.data : null;
  }
}