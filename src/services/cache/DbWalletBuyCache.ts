import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CacheEntity } from '../../model/entities/cache.entity';
import type { BuyWeightsCacheType } from '../types';
import { DBCache } from './DBCache';
import { CACHE } from '../../utils/constants';

@Injectable()
export class DbWalletBuyCache extends DBCache<number,BuyWeightsCacheType> {
  constructor(
    @InjectRepository(CacheEntity)
    private readonly cacheEntityRepository: Repository<CacheEntity>
    ) {
    super(cacheEntityRepository);
  }
  transformID(key: number): string {
    return CACHE.WALLET_BUY_PREFIX + Number(key);
  }

  async hasCachedBuyWeights(key: number): Promise<boolean> {
    const cache = this.get(key);
    return !!cache;
  }

}
