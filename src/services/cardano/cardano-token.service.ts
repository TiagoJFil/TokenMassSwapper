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
import { CARDANO } from '../../utils/constants';
import { ReplicaWalletEntity } from '../../model/entities/wallet/replica-wallet.entity';
import { Address, AssetInfo, Distribution, KeypairInfo, SWAP, SwapOptionsInput } from '../types';
import { CardanoWalletProviderService } from './provider/cardano-wallet-provider.service';



@Injectable()
export class CardanoTokenService {
  constructor(
    private readonly tokenService: DexhunterService,
    private readonly chainService: BlockChainService,
    private readonly walletService: WalletService,
    private readonly walletProvider: CardanoWalletProviderService,
  ) {}

  private async getCardanoTokenMetadata(assetId: string): Promise<AssetInfo> {
    //TODO: cache with db
    const assetInfo = await this.chainService.getTokenMetadata(assetId);
    return assetInfo;
  }

  async getTokenBalances(address) : Promise<AssetInfo[]> {
    const assetBalances = await this.chainService.getCardanoTokenBalances(address);
    console.log(assetBalances)
    const assets : AssetInfo[]= await Promise.all(assetBalances
      .map(async (asset) => {
        const tokenInfo = await this.getCardanoTokenMetadata(asset.unit);
        console.log(tokenInfo)
        if (tokenInfo === null) {
          return null;
        }
        return {
          policyId: tokenInfo.policyId,
          assetName: tokenInfo.assetName,
          ticker: tokenInfo.ticker,
          quantity: asset.quantity,
        };
      }))
    return assets.filter((asset) => asset !== null);
  }

  async getTokenBalance(address, policyId) {
    const assetBalances = await this.chainService.getCardanoTokenBalances(address);
    const asset = assetBalances.find((asset: AssetInfo) => asset.policyId === policyId);
    if (asset === undefined) {
      return 0;
    }
    return asset.quantity;
  }

  async getAdaBalance(address) {
    return await this.chainService.getAdaBalance(address);
  }

  async getTokenPrice(ticker) {
    throw new Error('Not implemented, not necessary now');
  }

  async multipleWalletBuyToken(userId, policyId, amount : number, options?: SwapOptionsInput) {
    const replicaWallets = await this.walletService.getActiveReplicaWallets(userId);
    const userWallet = await this.walletService.getUserWallet(userId);

    if (options.distribution === Distribution.UNIFORM) {
      return await this.multipleWalletSwapToken(SWAP.BUY, policyId, userWallet.address, replicaWallets, amount, options);
    } else {

      //TODO see logic about weighted distribution
      //TODO think about wallet balances
    }
    //selectItemBasedOnProbability
    return await this.multipleWalletSwapToken(SWAP.BUY, policyId, userWallet.address, replicaWallets, amount, options);
  }

  async multipleWalletSellToken(userId, policyId, percentage : number, options?: SwapOptionsInput) {
    if (percentage < 0 || percentage > 1) {
      throw new Error('Percentage must be between 0 and 1');
    }
    const replicaWallets = await this.walletService.getActiveReplicaWallets(userId);
    const userWallet = await this.walletService.getUserWallet(userId);
    let totalAmount = 0;
    let WalletBalanceMap = new Map();
    const replicasWithBalance = await Promise.all(replicaWallets.map(async (replica, index) => {
      const bal = await this.getTokenBalance(replica.address,policyId);
      totalAmount += bal;
      if (bal !== 0) {
        WalletBalanceMap.set(replica, bal);
        return replica;
      }
    }))
    const amount = totalAmount * percentage;
    if (amount === 0) {
      throw new Error('No tokens to sell');
    }
    if(options.distribution === Distribution.UNIFORM){
      return await this.multipleWalletSwapToken(SWAP.SELL,policyId,userWallet.address,replicasWithBalance, amount, options);
    }else{


    }

  }

  private async multipleWalletSwapToken(action:SWAP, policyId, userAddress, replicas : ReplicaWalletEntity[], amount : number | number[], options?: SwapOptionsInput) {
    if (options.slippage < 0 || options.slippage > 1) {
      throw new Error('Slippage must be between 0 and 1');
    }

    console.log(typeof amount)
    if (typeof amount !== 'number') {
      if (amount.length !== replicas.length) {
        throw new Error('Amounts and replicas must have the same length');
      }
    }
    let swapAmounts: number[];
    if (typeof amount === 'number') {
      swapAmounts = Array(replicas.length).fill(amount);
    }else {
      swapAmounts = amount;
    }

    const res= await Promise.all(replicas.map(async (replica,idx) => {
      let publicAddressToSend;
      if (options.selfSend) {
        publicAddressToSend = userAddress
      }else{
        publicAddressToSend = replica.address;
      }

      return await this.swapToken(
          { publicKey: publicAddressToSend, privateKey: replica.privateKey, stakeKey: replica.stakeAddress, stakePrivateKey : replica.stakePrivateKey },
          policyId,
          swapAmounts[idx],
          options.slippage,
          action
        );
      }
    ));
    return res;
  }

  private async swapToken(wallet: KeypairInfo, policyId, amount : number, slippage: number, action: SWAP) {
    try{
      return await this.tokenService.swapToken(
        wallet.publicKey,
        wallet.privateKey,
        wallet.stakePrivateKey,
        policyId,
        amount,
        slippage,
        action
      );
    }catch (e :any){
      if (e instanceof NotEnoughFundsDexHunterError){
        const walletBalance = await this.chainService.getAdaBalance(e.address)
        if (walletBalance < CARDANO.INDIVIDUAL_WALLET_MIN_BALANCE) {
          throw new NotEnoughFunds(e.address);
        }else{
          throw new InternalDexhunterError(e.message)  //retry?
        }
      }
      throw e
    }

  }


  async distributeAdaToReplicas(userId,amountAllocatedFromMain ,distribution: Distribution) {
    const replicas = await this.walletService.getActiveReplicaWallets(userId);
    const userWallet = await this.walletService.getUserWallet(userId);
    const mainWalletKeyPair = this.walletProvider.deriveUserKeyPair(userWallet.mnemonic);
    const mainWalletAddress = userWallet.address;
    const userWalletBalance = await this.chainService.getAdaBalance(mainWalletAddress);
    if (userWalletBalance < amountAllocatedFromMain) {
      throw new NotEnoughFunds(mainWalletAddress);
    }
    const totalReplicas = replicas.length;

    if (amountAllocatedFromMain < totalReplicas * CARDANO.INDIVIDUAL_WALLET_MIN_BALANCE) {
      throw new NotEnoughFundsForDistro(mainWalletAddress,totalReplicas,amountAllocatedFromMain);
    }

    /*
    let totalAmount = 0;
    let walletToBalanceMap = new Map();
    await Promise.all(replicas.map(async (replica) => {
      const bal = Math.floor(await this.chainService.getAdaBalance(replica.address));
      totalAmount += bal;

      walletToBalanceMap.set(replica, bal);
    }));
    */

    let extraAmount = 0;
    //TODO: inform the user about the extra amount that was left on the wallet due to the replicas already having balances
    switch (distribution) {
      case Distribution.UNIFORM: {
        const amountForEach = Math.floor(amountAllocatedFromMain / totalReplicas);

        const res = await Promise.all(replicas.map(async (replica) => {
          const bal = Math.floor(await this.chainService.getAdaBalance(replica.address));
          const amountToTransfer = amountForEach - bal;
          if (amountToTransfer <= 0) {
            return;
          }
          if (amountToTransfer < amountForEach) {
            extraAmount += amountForEach - amountToTransfer;
          }
          await this.chainService.sendCardano(mainWalletKeyPair.privateKey,mainWalletAddress, replica.address, amountToTransfer);
        }));
        console.log(res);
        return res;
      }
      case Distribution.WEIGHTED: {



      }
    }






  }
}


