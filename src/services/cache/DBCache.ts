import { Cache } from './Cache';
import { InjectRepository } from '@nestjs/typeorm';
import {  CacheEntity } from '../../model/entities/cache.entity';
import { Repository } from 'typeorm';

export abstract class DBCache<CacheKeyType, CacheDataType extends object> implements Cache<CacheKeyType,CacheDataType> {
  protected constructor(
    private readonly CacheEntityRepository: Repository<CacheEntity>,
  ) {}
  abstract transformID(key: CacheKeyType)  : string

  async invalidate(id: CacheKeyType): Promise<void> {
    await this.CacheEntityRepository.delete({ key : this.transformID(id) });
  }

  async add(id: CacheKeyType, cacheData: CacheDataType): Promise<void> {
    const cache = new CacheEntity();
    cache.key = this.transformID(id);
    cache.data = cacheData;
    await this.CacheEntityRepository.save(cache);
  }

  async get(id: CacheKeyType): Promise<CacheDataType> {
    const cache = await this.CacheEntityRepository.findOne({ where: { key: this.transformID(id) } });
    if(!cache) {
      return null
    }
    
    return cache.data as CacheDataType
  }
}