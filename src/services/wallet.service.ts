import { UserWallet } from '../model/entities/wallet/userWallet';
import { User } from '../model/entities/user';
import { ReplicaWallet } from '../model/entities/wallet/replicaWallet';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserNotFoundException, WalletNotFoundException } from './exceptions';
import { CardanoWalletProvider } from './cardano/provider/CardanoWalletProvider';

import { PublicWalletInfo } from './dto';
import { WalletManager } from '../model/entities/walletManager';
import { runOnTransactionCommit, runOnTransactionRollback, Transactional } from 'typeorm-transactional';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(UserWallet)
    private userWalletRepository: Repository<UserWallet>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(WalletManager)
    private walletManagerRepository: Repository<WalletManager>,
    private readonly walletProvider: CardanoWalletProvider,
  ) {}

  async createUserWallet(userId: number): Promise<UserWallet> {
    const mnemonic = this.walletProvider.generateMnemonic();

    const user = await this.userRepository.findOneBy({ id: userId });
    //assert that user exists
    if (!user) throw Error('User not found');
    const { publicKey, stakeKey, privateKey } =
      this.walletProvider.createUserKeyPair(mnemonic);
    //TODO: review what to do with the pk
    const wallet = new UserWallet(publicKey.toString(), stakeKey, mnemonic);
    wallet.user = user;
    wallet.stake_address = stakeKey;
    user.wallet = wallet;
    await this.userRepository.save(user);
    return await this.userWalletRepository.save(wallet);
  }

  @Transactional()
  async setReplicaWallets(
    userId: number,
    count: number,
  ): Promise<PublicKeyInfo[]> {
    //TODO limit count
    try{
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['wallet', 'walletManager'],
      });
      if (!user) throw new UserNotFoundException(userId);
      //create wallet manager if it doesn't exist
      if (!user.walletManager) {
        user.walletManager = new WalletManager();
        user.walletManager.user = user;
      }
      runOnTransactionCommit(() => console.log('post created'));
      runOnTransactionRollback((e) => console.log('post rolled back    ',e));

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

  private createReplicaWallets(userMnemonic: string,startingIdx:number, count: number) {
    const replicaWallets: ReplicaWallet[] = [];
    const replicaWalletsResultDTOList = [];

    for (let i = startingIdx +1; i < count + startingIdx +1; i++) {
      const replicaWallet = this.generateReplicaWallet(userMnemonic, i);
      replicaWallets.push(replicaWallet);
      const publicKey = replicaWallet.address;
      replicaWalletsResultDTOList.push({ publicKey });
    }

    return { replicaWallets, replicaWalletsResultDTOList };
  }

  async getReplicasCount(userId: number): Promise<number> {
    const user = await this.userRepository.findOneBy({ id: userId });
    //assert that user exists
    if (!user) throw new UserNotFoundException(userId);

    return (await this.walletManagerRepository
      .createQueryBuilder('walletManager')
      .where('walletManager.user.id = :id', { id: userId })
      .select('walletManager.currentReplicaAmount')
      .getOne()).currentReplicaAmount
  }

  async getUserPublicWalletInfo(userId: number): Promise<PublicWalletInfo> {
    const user = await this.userRepository.findOneBy({ id: userId });
    //assert that user exists
    if (!user) throw new UserNotFoundException(userId);

    const userWallet = await this.userWalletRepository.findOneBy({
      user: user,
    });
    //assert that user has a wallet
    if (!userWallet) throw new WalletNotFoundException('User has no wallet');
    return new PublicWalletInfo(userWallet.address, userWallet.stake_address);
  }
  private generateReplicaWallet(mnemonic: MyMnemonic, index: number) {
    if (index < 1) throw Error('Index must be greater than 1');
    const { publicKey, stakeKey, privateKey } =
      this.walletProvider.deriveKeypair(mnemonic, index);

    return new ReplicaWallet(
      publicKey.toString(),
      stakeKey,
      privateKey.toString(),
      index,
    );
  }

}

/*

export default class WalletService extends EventEmitter {


  async create (password: string) {
    const mnemonic = Mnemonic.random(24)
    await this.import(mnemonic.phrase, password)

    return mnemonic.phrase
  }

  async import (mnemonics: string, password: string) {
    if (!Mnemonic.validate(mnemonics)) throw Error('Invalid mnemonic')
  
    await LocalStorage.set("wallet", {
      encryptedKey: encryptXChaCha20Poly1305(mnemonics, password),
      accounts: [{
        name: "Wallet",
        receiveCount: 1,
        changeCount: 1      
      }]
    })

    await this.unlock(0, password)
    await this.sync()
  }

  async unlock (id: number, password: string) {
    const mnemonic = new Mnemonic(await this.export(password))
    const extendedKey = new XPrv(mnemonic.toSeed())
    const publicKey = await PublicKeyGenerator.fromMasterXPrv(
      extendedKey,
      false,
      BigInt(id)
    )
    
    await SessionStorage.set('session', {
      activeAccount: id,
      publicKey: publicKey.toString(),
      encryptedKey: encryptXChaCha20Poly1305(extendedKey.toString(), password)
    })

    await this.sync()
  }

  async export (password: string) {
    const wallet = await LocalStorage.get('wallet', undefined)

    if (!wallet) throw Error('Wallet is not initialized')

    return decryptXChaCha20Poly1305(wallet.encryptedKey, password)
  }

}
  //IGNORE
  */
