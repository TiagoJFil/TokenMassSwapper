import { EventEmitter } from "events"
import { Mnemonic, encryptXChaCha20Poly1305, decryptXChaCha20Poly1305, XPrv, PublicKeyGenerator } from "../../wasm"
import { UserWallet } from "../../model/entities/wallet/userWallet"
import { User } from "../../model/entities/user"
import type { PrivateKey } from "../../wasm/kaspa"
import { ReplicaWallet } from "../../model/entities/wallet/replicaWallet"
import type { WalletManager } from "../../model/entities/walletManager"
import { Injectable } from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {BaseEntity, Repository} from "typeorm";
import {UserNotFoundException, WalletNotFoundException} from "../exceptions.ts";



type Address = string


@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(UserWallet)
    private userWalletRepository: Repository<UserWallet>,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async createUserWallet(user_id: number): Promise<Address> {
    const mnemonic = KeypairGen.generateMnemonic()

    const user = await this.userRepository.findOneBy({id: user_id})
    //assert that user exists
    if (!user) throw Error("User not found")
    const {publicKey, privateKey} = await KeypairGen.createUserKeyPair(mnemonic)
    //TODO: review what to do with the pk
    let wallet = new UserWallet(
        publicKey.toString(),
        mnemonic.phrase
    )
    await this.userWalletRepository.save(wallet)

    return wallet.address
  }


    private async createReplicaWallets( walletManager: WalletManager,mnemonic: Mnemonic,index: number){
      const {publicKey, privateKey} = await KeypairGen.createKeypair(mnemonic,index)
      //save to db

      console.log(privateKey.toAddress)

      const wallet = new ReplicaWallet(
        publicKey.toString(),
        privateKey.toString(),
        walletManager
      )


      return {publicKey, privateKey}
    }


    async getUserWalletInfo(user_id: number) : Promise<Address> {
      const user = await this.userRepository.findOneBy({id: user_id})
      //assert that user exists
      if (!user) throw new UserNotFoundException(user_id)

      const userWallet = await this.userWalletRepository.findOneBy({user: user})
      //assert that user has a wallet
      if (!userWallet) throw new WalletNotFoundException("User has no wallet")
      return userWallet.address
    }
}

class KeypairGen {

  static generateMnemonic() : Mnemonic{
    return Mnemonic.random(24)
  }

  private static getMnemonicSeed(mnemonic : Mnemonic){
    const extendedKey = new XPrv(mnemonic.toSeed())
    return extendedKey;
  }

  static async createKeypair(mnemonic : Mnemonic, walletIndex: number) : Promise<walletGenerator> {
    if(walletIndex == 0) throw new Error("CANT CREATE WALLET WITH INDEX 0")
    return await this._createKeyPair(mnemonic,walletIndex)
  }

  static async createUserKeyPair(mnemonic : Mnemonic){
    return await this._createKeyPair(mnemonic, 0)
    
  }

  private static async _createKeyPair(mnemonic : Mnemonic,walletIndex: number){
    const extendedKey = this.getMnemonicSeed(mnemonic);
    
    const publicKey = await PublicKeyGenerator.fromMasterXPrv(
      extendedKey,
      false,
      BigInt(walletIndex)
    )

    
    return { 
      "publicKey": publicKey,
      "privateKey": extendedKey.toPrivateKey()
    }
  }

  
}

type walletGenerator = {
  publicKey: PublicKeyGenerator
  privateKey: PrivateKey
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