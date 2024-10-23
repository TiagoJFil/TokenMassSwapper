import { EventEmitter } from "events"
import { Mnemonic, encryptXChaCha20Poly1305, decryptXChaCha20Poly1305, XPrv, PublicKeyGenerator } from "@/../wasm"
import { UserWallet } from "../../model/entities/wallet/userWallet"
import { User } from "../../model/entities/user"






export default class WalletService {


  async createUserWallet(user_id: number) {
    const mnemonic = Mnemonic.random(24)
    const extendedKey = new XPrv(mnemonic.toSeed())
    const publicKey = await PublicKeyGenerator.fromMasterXPrv(
      extendedKey,
      false,
      BigInt(0)
    )
    const user = await User.findOneBy({id: user_id})
    //assert that user exists
    if (!user) throw Error("User not found")
    
    let wallet = new UserWallet(
      publicKey.toString(),
      mnemonic.phrase,
      user
    )
    
    await wallet.save()
  }

  async createReplicaWallet(){
    
  }


  private async createKeypair() {
    const mnemonic = Mnemonic.random(24)
    const extendedKey = new XPrv(mnemonic.toSeed())
    const publicKey = await PublicKeyGenerator.fromMasterXPrv(
      extendedKey,
      false,
      BigInt(0)
    )
    
    return [publicKey.toString(), mnemonic.phrase]
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