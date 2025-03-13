import { DexhunterService } from './provider/dexhunter.service';
import { BlockChainService } from './provider/block-chain.service';
import { Injectable } from '@nestjs/common';
import { WalletService } from '../wallet.service';
import {
  InternalDexhunterError,
  NotEnoughFunds,
  NotEnoughFundsDexHunterError,
  NotEnoughFundsForDistro,
} from '../exceptions/custom';
import {
  CARDANO,
  TOKEN_DISTRIBUTE_WEIGHTS_TABLES,
} from '../../utils/constants';
import { ReplicaWalletEntity } from '../../model/entities/wallet/replica-wallet.entity';
import {
  AdaSendInfo,
  AssetInfo,
  AssetInfoDTO,
  Distribution,
  KeypairInfo,
  SWAP,
  SwapOptionsInput,
} from '../types';
import { CardanoWalletProviderService } from './provider/cardano-wallet-provider.service';
import {
  cutTableOutcomeHigherThan,
  selectItemBasedOnProbability,
} from '../../utils/utils';
import { WalletBuyCache } from '../cache/WalletBuyCache';

@Injectable()
export class CardanoTokenService {
  constructor(
    private readonly tokenService: DexhunterService,
    private readonly chainService: BlockChainService,
    private readonly walletService: WalletService,
    private readonly walletProvider: CardanoWalletProviderService,
    private readonly walletBuyCache: WalletBuyCache
  ) {}

  private async getCardanoTokenMetadata(assetId: string): Promise<AssetInfo> {
    //TODO: cache with db
    const assetInfo = await this.chainService.getTokenMetadata(assetId);
    return assetInfo;
  }

  async getTokenBalances(address): Promise<AssetInfo[]> {
    const assetBalances =
      await this.chainService.getCardanoTokenBalances(address);
    const assets: AssetInfo[] = await Promise.all(
      assetBalances.map(async (asset) => {
        const tokenInfo = await this.getCardanoTokenMetadata(asset.unit);
        if (tokenInfo === null) {
          return null;
        }
        return {
          policyId: tokenInfo.policyId,
          assetName: tokenInfo.assetName,
          ticker: tokenInfo.ticker,
          quantity: Number(asset.quantity),
        };
      }),
    );
    return assets.filter((asset) => asset !== null);
  }
  async getAdaBalance(address) {
    return await this.chainService.getAdaBalance(address);
  }

  async getTokenBalance(address, policyId) {
    const assetBalances =
      await this.chainService.getCardanoTokenBalances(address);
    const asset = assetBalances.find(
      (asset: AssetInfo) => asset.policyId === policyId,
    );
    if (asset === undefined) {
      return 0;
    }
    return asset.quantity;
  }

  async getWalletBalances(
    address,
  ): Promise<{ ada: number; tokens: AssetInfoDTO[] }> {
    const allWalletAssetsInfo =
      await this.chainService.getWalletBalances(address);

    const assets: {
      policyId: string;
      assetName: string;
      ticker: string;
      quantity: number;
    }[] = await Promise.all(
      allWalletAssetsInfo.tokens.map(async (asset) => {
        const tokenInfo = await this.getCardanoTokenMetadata(asset.unit);
        if (tokenInfo === null) {
          return null;
        }
        return {
          policyId: tokenInfo.policyId,
          assetName: tokenInfo.assetName,
          ticker: tokenInfo.ticker,
          quantity: Number(asset.quantity),
        };
      }),
    );
    const assetsNonNull: AssetInfoDTO[] = assets.filter(
      (asset) => asset !== null,
    );

    return {
      ada: allWalletAssetsInfo.adaBal,
      tokens: assetsNonNull,
    };
  }

  async getTokenPrice(ticker) {
    throw new Error('Not implemented, not necessary now');
  }

  async multipleWalletBuyToken(
    userId,
    policyId,
    amount: number,
    options?: SwapOptionsInput,
  ) {
    const replicaWallets =
      await this.walletService.getActiveReplicaWallets(userId);
    const userWallet = await this.walletService.getUserWallet(userId);

    switch (options.distribution) {
      case Distribution.UNIFORM: {
        return await this.multipleWalletSwapToken(
          SWAP.BUY,
          policyId,
          userWallet.address,
          replicaWallets,
          amount,
          options,
        );
      }
      case Distribution.WEIGHTED: {
        //TODO add a cache with hint, and and endpoint to prepare the swap

        const amounts = await Promise.all(Array(replicaWallets.length).map(
          async() => {
            const bal = await this.getTokenBalance(userWallet.address, policyId);
            const newTable = cutTableOutcomeHigherThan(TOKEN_DISTRIBUTE_WEIGHTS_TABLES.SIMPLE,bal- CARDANO.INDIVIDUAL_WALLET_MIN_BALANCE)  // - 10 to avoid sending all the balance
            return selectItemBasedOnProbability(newTable)
          }));

        return await this.multipleWalletSwapToken(
          SWAP.BUY,
          policyId,
          userWallet.address,
          replicaWallets,
          amounts,
          options,
        );
      }
    }

  }

  async multipleWalletSellToken(
    userId,
    policyId,
    percentage: number,
    options?: SwapOptionsInput,
  ) {
    if (percentage < 0 || percentage > 1) {
      throw new Error('Percentage must be between 0 and 1');
    }
    const replicaWallets =
      await this.walletService.getActiveReplicaWallets(userId);
    const userWallet = await this.walletService.getUserWallet(userId);
    let totalAmount = 0;
    let WalletBalanceMap = new Map();
    const replicasWithBalance = await Promise.all(
      replicaWallets.map(async (replica, index) => {
        const bal = await this.getTokenBalance(replica.address, policyId);
        totalAmount += bal;
        if (bal !== 0) {
          WalletBalanceMap.set(replica, bal);
          return replica;
        }
      }),
    );
    const amount = totalAmount * percentage;
    if (amount === 0) {
      throw new Error('No tokens to sell');
    }
    if (options.distribution === Distribution.UNIFORM) {
      return await this.multipleWalletSwapToken(
        SWAP.SELL,
        policyId,
        userWallet.address,
        replicasWithBalance,
        amount,
        options,
      );
    } else {
    }
  }

  private async multipleWalletSwapToken(
    action: SWAP,
    policyId,
    userAddress,
    replicas: ReplicaWalletEntity[],
    amount: number | number[],
    options?: SwapOptionsInput,
  ) {
    if (options.slippage < 0 || options.slippage > 1) {
      throw new Error('Slippage must be between 0 and 1');
    }

    if (typeof amount !== 'number') {
      if (amount.length !== replicas.length) {
        throw new Error('Amounts and replicas must have the same length');
      }
    }
    let swapAmounts: number[];
    if (typeof amount === 'number') {
      swapAmounts = Array(replicas.length).fill(amount);
    } else {
      swapAmounts = amount;
    }

    const res = await Promise.all(
      replicas.map(async (replica, idx) => {
        let publicAddressToSend;
        if (options.selfSend) {
          publicAddressToSend = userAddress;
        } else {
          publicAddressToSend = replica.address;
        }

        return await this.swapToken(
          {
            publicKey: publicAddressToSend,
            privateKey: replica.privateKey,
            stakeKey: replica.stakeAddress,
            stakePrivateKey: replica.stakePrivateKey,
          },
          policyId,
          swapAmounts[idx],
          options.slippage,
          action,
        );
      }),
    );
    return res;
  }

  private async swapToken(
    wallet: KeypairInfo,
    policyId,
    amount: number,
    slippage: number,
    action: SWAP,
  ) {
    try {
      return await this.tokenService.swapToken(
        wallet.publicKey,
        wallet.privateKey,
        wallet.stakePrivateKey,
        policyId,
        amount,
        slippage,
        action,
      );
    } catch (e: any) {
      if (e instanceof NotEnoughFundsDexHunterError) {
        const walletBalance = await this.chainService.getAdaBalance(e.address);
        if (walletBalance < CARDANO.INDIVIDUAL_WALLET_MIN_BALANCE) {
          throw new NotEnoughFunds(e.address);
        } else {
          throw new InternalDexhunterError(e.message); //retry?
        }
      }
      throw e;
    }
  }

  async distributeAdaToReplicas(
    userId,
    amountAllocatedFromMain,
    distribution: Distribution,
  ) {
    const replicas = await this.walletService.getActiveReplicaWallets(userId);
    const userWallet = await this.walletService.getUserWallet(userId);
    const mainWalletKeyPair = this.walletProvider.deriveUserKeyPair(userWallet.mnemonic);
    const mainWalletAddress = userWallet.address;
    const userWalletBalance = await this.chainService.getAdaBalance(mainWalletAddress);
    if (userWalletBalance < amountAllocatedFromMain) {
      throw new NotEnoughFunds(mainWalletAddress);
    }
    const totalReplicas = replicas.length;

    if (
      amountAllocatedFromMain <
      totalReplicas * CARDANO.INDIVIDUAL_WALLET_MIN_BALANCE
    ) {
      throw new NotEnoughFundsForDistro(
        mainWalletAddress,
        totalReplicas,
        amountAllocatedFromMain,
      );
    }

    let extraAmount = 0;
    switch (distribution) {
      case Distribution.UNIFORM: {
        const amountForEach = Math.floor(
          amountAllocatedFromMain / totalReplicas,
        );

        const adaSendInfo : AdaSendInfo[] =replicas.map((replica) => {
          return {
            address: replica.address,
            amount: amountForEach,
          }
        })
        const txHash = await this.chainService.sendCardano(
          mainWalletKeyPair.privateKey,
          mainWalletAddress,
          adaSendInfo,
        );

        return {
          amounts: adaSendInfo,
          extra: extraAmount,
          txHash,
        };
      }
      case Distribution.WEIGHTED: {
        const probabilityTable = TOKEN_DISTRIBUTE_WEIGHTS_TABLES.SIMPLE;

        let alreadySent = 0;
        let totalAmount = amountAllocatedFromMain;

        let adaSendInfo : AdaSendInfo[] = []
        for (const currReplica of replicas) {
          const amtToSend = selectItemBasedOnProbability(probabilityTable);
          if (totalAmount < 0) {
            extraAmount = totalAmount - alreadySent;
            break;
          }
          alreadySent += amtToSend
          adaSendInfo.push({
            address: currReplica.address,
            amount: amtToSend,
          });
        }

        const txHash = await this.chainService.sendCardano(
          mainWalletKeyPair.privateKey,
          mainWalletAddress,
          adaSendInfo
        );
        return {
          amounts: adaSendInfo,
          extra: extraAmount,
          txHash,
        };
      }
    }
  }

  async prepareBuyTransactionCache(userId: number) {
    const hasCache = await this.walletBuyCache.hasCachedBuyWeights(userId);
    if (hasCache) {
      await this.walletBuyCache.invalidateCache(userId);
    }

    const replicaWallets = await this.walletService.getActiveReplicaWallets(userId);
    const distributedBalances = await Promise.all(replicaWallets.map(async (wallet) => {
      const bal = await this.getAdaBalance(wallet.address);
      const newTable = cutTableOutcomeHigherThan(TOKEN_DISTRIBUTE_WEIGHTS_TABLES.SIMPLE, bal - CARDANO.INDIVIDUAL_WALLET_MIN_BALANCE);
      return selectItemBasedOnProbability(newTable);
    }));

    const cacheData = {
      walletCount: replicaWallets.length,
      distributedBalances,
    };

    await this.walletBuyCache.addToCache(userId, cacheData);
    return cacheData;
  }
}


