export interface WalletBuyCache {
  hasCachedBuyWeights(userId: number): Promise<boolean>;
  invalidateCache(userId: number): Promise<void>;
  addToCache(userId: number, cacheData: any): Promise<void>;
  getCache(userId: number): Promise<any>;
}