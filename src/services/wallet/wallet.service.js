import { __decorate, __metadata, __param } from "tslib";
import { EventEmitter } from "events";
import { Mnemonic, encryptXChaCha20Poly1305, decryptXChaCha20Poly1305, XPrv, PublicKeyGenerator } from "../../wasm";
import { UserWallet } from "../../model/entities/wallet/userWallet";
import { User } from "../../model/entities/user";
import { ReplicaWallet } from "../../model/entities/wallet/replicaWallet";
import { Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { BaseEntity, Repository } from "typeorm";
import { UserNotFoundException, WalletNotFoundException } from "../exceptions.ts";
let WalletService = class WalletService {
    userWalletRepository;
    userRepository;
    constructor(userWalletRepository, userRepository) {
        this.userWalletRepository = userWalletRepository;
        this.userRepository = userRepository;
    }
    async createUserWallet(user_id) {
        const mnemonic = KeypairGen.generateMnemonic();
        const user = await this.userRepository.findOneBy({ id: user_id });
        //assert that user exists
        if (!user)
            throw Error("User not found");
        const { publicKey, privateKey } = await KeypairGen.createUserKeyPair(mnemonic);
        //TODO: review what to do with the pk
        let wallet = new UserWallet(publicKey.toString(), mnemonic.phrase);
        await this.userWalletRepository.save(wallet);
        return wallet.address;
    }
    async createReplicaWallets(walletManager, mnemonic, index) {
        const { publicKey, privateKey } = await KeypairGen.createKeypair(mnemonic, index);
        //save to db
        console.log(privateKey.toAddress);
        const wallet = new ReplicaWallet(publicKey.toString(), privateKey.toString(), walletManager);
        return { publicKey, privateKey };
    }
    async getUserWalletInfo(user_id) {
        const user = await this.userRepository.findOneBy({ id: user_id });
        //assert that user exists
        if (!user)
            throw new UserNotFoundException(user_id);
        const userWallet = await this.userWalletRepository.findOneBy({ user: user });
        //assert that user has a wallet
        if (!userWallet)
            throw new WalletNotFoundException("User has no wallet");
        return userWallet.address;
    }
};
WalletService = __decorate([
    Injectable(),
    __param(0, InjectRepository(UserWallet)),
    __param(1, InjectRepository(User)),
    __metadata("design:paramtypes", [Repository,
        Repository])
], WalletService);
export { WalletService };
class KeypairGen {
    static generateMnemonic() {
        return Mnemonic.random(24);
    }
    static getMnemonicSeed(mnemonic) {
        const extendedKey = new XPrv(mnemonic.toSeed());
        return extendedKey;
    }
    static async createKeypair(mnemonic, walletIndex) {
        if (walletIndex == 0)
            throw new Error("CANT CREATE WALLET WITH INDEX 0");
        return await this._createKeyPair(mnemonic, walletIndex);
    }
    static async createUserKeyPair(mnemonic) {
        return await this._createKeyPair(mnemonic, 0);
    }
    static async _createKeyPair(mnemonic, walletIndex) {
        const extendedKey = this.getMnemonicSeed(mnemonic);
        const publicKey = await PublicKeyGenerator.fromMasterXPrv(extendedKey, false, BigInt(walletIndex));
        return {
            "publicKey": publicKey,
            "privateKey": extendedKey.toPrivateKey()
        };
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
