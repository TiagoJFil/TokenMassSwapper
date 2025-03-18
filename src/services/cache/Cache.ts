
export interface Cache<CacheKeyType,DataType>{
  invalidate(key: CacheKeyType): Promise<void>;
  add(key: CacheKeyType, cacheData: DataType): Promise<void>;
  get(key: CacheKeyType): Promise<DataType>;
}
