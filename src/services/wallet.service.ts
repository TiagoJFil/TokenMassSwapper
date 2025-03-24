import { UserWalletEntity } from '../model/entities/wallet/user-wallet.entity';
import { UserEntity } from '../model/entities/user.entity';
import { ReplicaWalletEntity } from '../model/entities/wallet/replica-wallet.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserNotFoundException, WalletManagerNotFoundException, WalletNotFoundException } from './exceptions/generic';
import { CardanoWalletProviderService } from './cardano/provider/cardano-wallet-provider.service';
import { WalletManagerEntity } from '../model/entities/wallet-manager.entity';
import { runOnTransactionCommit, runOnTransactionRollback, Transactional } from 'typeorm-transactional';
import { MyMnemonic, PublicKeyInfo, PublicWalletInfo } from './types';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(UserWalletEntity)
    private userWalletRepository: Repository<UserWalletEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(WalletManagerEntity)
    private walletManagerRepository: Repository<WalletManagerEntity>,
    private readonly walletProvider: CardanoWalletProviderService,
  ) {}

  async createUserWallet(userID: string): Promise<UserWalletEntity> {
    const mnemonic = this.walletProvider.generateMnemonic();

    const user = await this.userRepository.findOneBy({ id: userID });
    //assert that user exists
    if (!user) throw Error('UserEntity not found');
    const { publicKey, stakeKey, privateKey, stakePrivateKey } =
      this.walletProvider.deriveUserKeyPair(mnemonic);
    //TODO: review what to do with the pk
    const wallet = new UserWalletEntity(publicKey.toString(), stakeKey, mnemonic);
    wallet.user = user;
    wallet.stakeAddress = stakeKey;
    user.wallet = wallet;
    await this.userRepository.save(user);
    return await this.userWalletRepository.save(wallet);
  }

  async getUserWallet(userID: string): Promise<UserWalletEntity> {
    const user = await this.userRepository.findOneBy({ id: userID });
    //assert that user exists
    if (!user) throw new UserNotFoundException(userID);

    const userWallet = await this.userWalletRepository.findOneBy({
      user: user,
    });
    //assert that user has a wallet
    if (!userWallet) throw new WalletNotFoundException('UserEntity has no wallet');
    return userWallet;
  }

  async getActiveReplicaWallets(userID: string): Promise<ReplicaWalletEntity[]> {
    const user = await this.userRepository.findOneBy({ id: userID });
    //assert that user exists
    if (!user) throw new UserNotFoundException(userID);

    const walletManager = await this.walletManagerRepository.findOne({
      where: { user: user },
      relations: ['wallets'],
    });
    //assert that user has a wallet manager
    if (!walletManager) return [];
    if (walletManager.currentReplicaAmount < 1) return [];
    else {
      const replicaWallets = await walletManager.wallets;
      return replicaWallets.slice(0, walletManager.currentReplicaAmount);
    }
  }

  @Transactional()
  async setReplicaWallets(
    userID: string,
    count: number,
  ): Promise<PublicKeyInfo[]> {
    //TODO limit count
    try{
      const user = await this.userRepository.findOne({
        where: { id: userID },
        relations: ['wallet', 'walletManager'],
      });
      if (!user) throw new UserNotFoundException(userID);
      //create wallet manager if it doesn't exist
      if (!user.walletManager) {
        user.walletManager = new WalletManagerEntity();
        user.walletManager.user = user;
      }
      runOnTransactionCommit(() => console.log('post created'));
      runOnTransactionRollback((e) => console.log('post rolled back    ',e));
//TODO:r() runontransactioncommit check this
      const walletsToGenerate = count - user.walletManager.currentReplicaAmount;

      if (walletsToGenerate < 1) {
        user.walletManager.currentReplicaAmount = count;
        await this.userRepository.save(user);
        return []; //TODO: return the wallets that already exist
      }

      const { replicaWallets, replicaWalletsResultDTOList } =
        this.createReplicaWallets(user.wallet.mnemonic,user.walletManager.currentReplicaAmount, walletsToGenerate);
      user.walletManager.currentReplicaAmount = count;
      const savedWallets = await user.walletManager.wallets;
      if (!savedWallets) {
        user.walletManager.wallets = replicaWallets;
      }else{
        user.walletManager.wallets = savedWallets.concat(replicaWallets);
      }
      await this.userRepository.save(user);

      return replicaWalletsResultDTOList;
    }catch(err){
      throw err;
    }
  }


  async getReplicasCount(userID: string): Promise<number> {
    const user = await this.userRepository.findOneBy({ id: userID });
    //assert that user exists
    if (!user) throw new UserNotFoundException(userID);

    return (await this.walletManagerRepository
      .createQueryBuilder('walletManager')
      .where('walletManager.user.id = :id', { id: userID })
      .select('walletManager.currentReplicaAmount')
      .getOne()).currentReplicaAmount
  }

  async getUserPublicWalletInfo(userID: string): Promise<PublicWalletInfo> {
    const user = await this.userRepository.findOneBy({ id: userID });
    //assert that user exists
    if (!user) throw new UserNotFoundException(userID);

    const userWallet = await this.userWalletRepository.findOneBy({
      user: user,
    });
    //assert that user has a wallet
    if (!userWallet) throw new WalletNotFoundException('UserEntity has no wallet');
    return { address: userWallet.address, stakeKey: userWallet.stakeAddress};
  }

  private createReplicaWallets(userMnemonic: string, startingIdx:number, count: number) {
    const replicaWallets: ReplicaWalletEntity[] = [];
    const replicaWalletsResultDTOList = [];

    for (let i = startingIdx +1; i < count + startingIdx +1; i++) {
      const replicaWallet = this.generateReplicaWallet(userMnemonic, i);
      replicaWallets.push(replicaWallet);
      const publicKey = replicaWallet.address;
      replicaWalletsResultDTOList.push({ publicKey });
    }

    return { replicaWallets, replicaWalletsResultDTOList };
  }

  private generateReplicaWallet(mnemonic: MyMnemonic, index: number) {
    if (index < 1) throw Error('Index must be greater than 1');
    const { publicKey, stakeKey, privateKey, stakePrivateKey } =
      this.walletProvider.deriveKeypair(mnemonic, index);

    return new ReplicaWalletEntity(
      publicKey.toString(),
      stakeKey,
      privateKey.toString(),
      stakePrivateKey.toString(),
      index,
    );
  }

}
