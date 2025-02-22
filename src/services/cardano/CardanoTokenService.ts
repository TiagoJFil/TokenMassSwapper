import { DexHunterService } from './provider/DexHunterService';
import { BlockChainService } from './provider/block-chain.service';
import { Injectable } from '@nestjs/common';
import { WalletService } from '../wallet.service';
import { InternalDexhunterError, NotEnoughFunds, NotEnoughFundsDexHunterError } from '../exceptions/exceptions';
import { CARDANO } from '../../utils/constants';
import { ReplicaWallet } from '../../model/entities/wallet/replicaWallet';
import { Distribution, KeypairInfo, SWAP, SwapOptionsInput } from '../types';



@Injectable()
export class CardanoTokenService {
  constructor(
    private readonly tokenService: DexHunterService,
    private readonly walletService: WalletService,
    private readonly chainService: BlockChainService,
  ) {}

  private async getCardanoTokenMetadata(assetId: string): Promise<AssetInfo> {
    //TODO: cache with db
    const assetInfo = await this.chainService.getTokenMetadata(assetId);
    return assetInfo;
  }

  async getTokenBalances(address) : Promise<AssetInfo[]> {
    const assetBalances =
      await this.chainService.getCardanoTokenBalances(address);
    console.log(assetBalances);
    return assetBalances
      .map(async (asset) => {
        const tokenInfo = await this.getCardanoTokenMetadata(asset.unit);
        if (tokenInfo === null) {
          return null;
        }
        return {
          policyId: tokenInfo.policyId,
          assetName: tokenInfo.assetName,
          ticker: tokenInfo.ticker,
          quantity: asset.quantity,
        };
      })
      .filter((asset) => asset !== null);
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

  private async multipleWalletSwapToken(action:SWAP, policyId, userAddress,replicas : ReplicaWallet[], amount : number | number[], options?: SwapOptionsInput) {
    if (options.slippage < 0 || options.slippage > 1) {
      throw new Error('Slippage must be between 0 and 1');
    }
    options.selfSend = options.selfSend || false;
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
        if (walletBalance < CARDANO.WALLET_MIN_BALANCE) {
          throw new NotEnoughFunds(e.address);
        }else{
          throw new InternalDexhunterError(e.message)  //retry?
        }
      }
      throw e
    }

  }

}


