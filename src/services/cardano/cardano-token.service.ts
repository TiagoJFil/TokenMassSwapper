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
  TOKEN_BUY_WEIGHTS_TABLES,
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
import { selectItemBasedOnProbability } from '../../utils/utils';
import { WalletBuyCache } from '../cache/WalletBuyCache';

@Injectable()
export class CardanoTokenService {
  constructor(
    private readonly tokenService: DexhunterService,
    private readonly chainService: BlockChainService,
    private readonly walletService: WalletService,
    private readonly walletProvider: CardanoWalletProviderService,
    private readonly walletBuyCache: WalletBuyCache,
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

    // If useCache is true, try to use cached values first
    if (options.useCache) {
      const walletIds = replicaWallets.map(wallet => wallet.address); // Use address as unique identifier
      const cachedAmounts = await this.walletBuyCache.getCachedBuyAmounts(walletIds);
      
      // If we have cached values for at least some wallets, use them
      if (cachedAmounts.size > 0) {
        const validWallets = [];
        const validAmounts = [];
        
        for (const wallet of replicaWallets) {
          const cachedAmount = cachedAmounts.get(wallet.address);
          if (cachedAmount && cachedAmount > 0) {
            validWallets.push(wallet);
            validAmounts.push(cachedAmount);
          }
        }
        
        // If we have valid amounts for some wallets, execute the swap
        if (validWallets.length > 0) {
          console.log(`Using ${validWallets.length} cached wallet buy amounts`);
          return await this.multipleWalletSwapToken(
            SWAP.BUY,
            policyId,
            userWallet.address,
            validWallets,
            validAmounts,
            options,
          );
        }
      }
      // If no cache or empty cache, continue with normal distribution logic
    }

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
        // Import the weights table if not already imported
        const probabilityTable = TOKEN_DISTRIBUTE_WEIGHTS_TABLES.SIMPLE;
        
        // Fetch wallet balances in parallel for speed
        const walletBalances = await Promise.all(
          replicaWallets.map(async (wallet) => {
            return {
              wallet,
              balance: await this.chainService.getAdaBalance(wallet.address)
            };
          })
        );
        
        // Try up to 6 times to find a valid distribution
        let validDistribution = false;
        let attempts = 0;
        const maxAttempts = 6;
        let buyAmounts: number[] = [];
        
        while (!validDistribution && attempts < maxAttempts) {
          buyAmounts = [];
          validDistribution = true;
          
          // Try to generate a valid distribution
          for (const walletInfo of walletBalances) {
            // Get a random amount based on probability
            const amtToBuy = selectItemBasedOnProbability(probabilityTable);
            
            // Check if wallet has enough funds
            if (walletInfo.balance < amtToBuy + CARDANO.INDIVIDUAL_WALLET_MIN_BALANCE) {
              validDistribution = false;
              break;
            }
            
            buyAmounts.push(amtToBuy);
          }
          
          attempts++;
        }
        
        // If no valid distribution after 6 attempts, use max available balance
        if (!validDistribution) {
          buyAmounts = walletBalances.map(walletInfo => 
            Math.max(0, walletInfo.balance - CARDANO.INDIVIDUAL_WALLET_MIN_BALANCE)
          );
        }
        
        // Filter out wallets with zero buy amount for speed
        const validWallets = [];
        const validAmounts = [];
        
        for (let i = 0; i < replicaWallets.length; i++) {
          if (buyAmounts[i] > 0) {
            validWallets.push(replicaWallets[i]);
            validAmounts.push(buyAmounts[i]);
          }
        }
        
        return await this.multipleWalletSwapToken(
          SWAP.BUY,
          policyId,
          userWallet.address,
          validWallets,
          validAmounts,
          options,
        );
      }
    }

    // Default behavior if distribution isn't handled
    return await this.multipleWalletSwapToken(
      SWAP.BUY,
      policyId,
      userWallet.address,
      replicaWallets,
      amount,
      options,
    );
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
    setCache = false,
  ) {
    const replicas = await this.walletService.getActiveReplicaWallets(userId);
    const userWallet = await this.walletService.getUserWallet(userId);
    const mainWalletKeyPair = this.walletProvider.deriveUserKeyPair(
      userWallet.mnemonic,
    );
    const mainWalletAddress = userWallet.address;
    const userWalletBalance =
      await this.chainService.getAdaBalance(mainWalletAddress);
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
        
        // Save cache if requested
        if (setCache) {
          for (const info of adaSendInfo) {
            await this.walletBuyCache.setCacheBuyAmount(info.address, info.amount);
          }
        }

        return {
          amounts: adaSendInfo,
          extra: extraAmount,
          txHash,
          cached: setCache,
        };
      }
      case Distribution.WEIGHTED: {
        const probabilityTable = TOKEN_DISTRIBUTE_WEIGHTS_TABLES.SIMPLE;
        
        // Make multiple attempts to find a valid distribution
        let adaSendInfo: AdaSendInfo[] = [];
        let validDistribution = false;
        let attempts = 0;
        const maxAttempts = 45;
        
        while (!validDistribution && attempts < maxAttempts) {
          let alreadySent = 0;
          adaSendInfo = [];
          
          // Try to create a distribution for all replicas
          for (const currReplica of replicas) {
            const amtToSend = selectItemBasedOnProbability(probabilityTable);
            
            // Check if adding this amount would exceed the allocated amount
            if (alreadySent + amtToSend > amountAllocatedFromMain) {
              break; // This distribution exceeds the limit, try again
            }
            
            alreadySent += amtToSend;
            adaSendInfo.push({
              address: currReplica.address,
              amount: amtToSend,
            });
          }
          
          // Check if we have a valid distribution for all replicas
          if (adaSendInfo.length === replicas.length) {
            validDistribution = true;
            extraAmount = amountAllocatedFromMain - alreadySent;
          }
          
          attempts++;
        }
        
        // If we couldn't find a valid distribution after max attempts,
        // distribute the remaining amount to the last wallet
        if (!validDistribution) {
          adaSendInfo = [];
          let alreadySent = 0;
          
          // Distribute to all wallets except the last one
          for (let i = 0; i < replicas.length - 1; i++) {
            const amtToSend = selectItemBasedOnProbability(probabilityTable);
            if (alreadySent + amtToSend > amountAllocatedFromMain) {
              // Skip this wallet if it would exceed the limit
              continue;
            }
            
            alreadySent += amtToSend;
            adaSendInfo.push({
              address: replicas[i].address,
              amount: amtToSend,
            });
          }
          
          // Put the remaining amount in the last wallet
          const remainingAmount = amountAllocatedFromMain - alreadySent;
          if (remainingAmount > 0) {
            adaSendInfo.push({
              address: replicas[replicas.length - 1].address,
              amount: remainingAmount,
            });
          }
          
          extraAmount = 0; // All funds are distributed
        }
        console.log("took, attempts", attempts)
        const txHash = await this.chainService.sendCardano(
          mainWalletKeyPair.privateKey,
          mainWalletAddress,
          adaSendInfo
        );
        
        // Save cache if requested
        if (setCache) {
          for (const info of adaSendInfo) {
            await this.walletBuyCache.setCacheBuyAmount(info.address, info.amount);
          }
        }
        
        return {
          amounts: adaSendInfo,
          extra: extraAmount,
          txHash,
          cached: setCache,
        };
      }
    }
  }
}


