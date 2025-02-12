import { EventEmitter } from 'events';
import { UserWallet } from '../model/entities/wallet/userWallet';
import { User } from '../model/entities/user';
import { ReplicaWallet } from '../model/entities/wallet/replicaWallet';
import type { WalletManager } from '../model/entities/walletManager';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseEntity, Repository } from 'typeorm';
import { UserNotFoundException, WalletNotFoundException } from './exceptions';
import { CardanoWalletProvider } from './cardano/provider/CardanoWalletProvider';
import { Wallet } from '../model/entities/wallet/wallet';
import { PublicWalletInfo } from './dto';

@Injectable()
export class WalletService  {
  constructor(
    @InjectRepository(UserWallet)
    private userWalletRepository: Repository<UserWallet>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly walletProvider: CardanoWalletProvider
  ) {}

  async createUserWallet(userId: number): Promise<UserWallet> {
    const mnemonic = this.walletProvider.generateMnemonic()

    const user = await this.userRepository.findOneBy({ id: userId });
    //assert that user exists
    if (!user) throw Error('User not found');
    const { publicKey, privateKey, stakeKey } = await this.walletProvider.createUserKeyPair(mnemonic);
    //TODO: review what to do with the pk
    const wallet = new UserWallet(publicKey.toString(), mnemonic);
    wallet.user = user;
    wallet.stake_address = stakeKey;
    user.wallet = wallet;
    await this.userRepository.save(user);
    return await this.userWalletRepository.save(wallet);

  }

  private async createReplicaWallets(
    walletManager: WalletManager,
    mnemonic: MyMnemonic,
    index: number,
  ) {
    const { publicKey, privateKey } = await this.walletProvider.deriveKeypair(
      mnemonic,
      index,
    );
    //save to db

    console.log(privateKey);

    const wallet = new ReplicaWallet(
      publicKey.toString(),
      privateKey.toString(),
      index
    );
    wallet.managed_by = walletManager

    return { publicKey, privateKey };
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
