//
//
// import {
//   Mnemonic,
//   encryptXChaCha20Poly1305,
//   decryptXChaCha20Poly1305,
//   XPrv,
//   PublicKeyGenerator,
// } from '../../wasm';
// import type { PrivateKey } from '../../wasm/kaspa';
//
// class KeypairGen {
//   static generateMnemonic(): Mnemonic {
//     return Mnemonic.random(24);
//   }
//
//   private static getMnemonicSeed(mnemonic: Mnemonic) {
//     const extendedKey = new XPrv(mnemonic.toSeed());
//     return extendedKey;
//   }
//
//   static async createKeypair(
//     mnemonic: Mnemonic,
//     walletIndex: number,
//   ): Promise<walletGenerator> {
//     if (walletIndex == 0) throw new Error('CANT CREATE WALLET WITH INDEX 0');
//     return await this._createKeyPair(mnemonic, walletIndex);
//   }
//
//   static async createUserKeyPair(mnemonic: Mnemonic) {
//     return await this._createKeyPair(mnemonic, 0);
//   }
//
//   private static async _createKeyPair(mnemonic: Mnemonic, walletIndex: number) {
//     const extendedKey = this.getMnemonicSeed(mnemonic);
//
//     const publicKey = await PublicKeyGenerator.fromMasterXPrv(
//       extendedKey,
//       false,
//       BigInt(walletIndex),
//     );
//
//     return {
//       publicKey: publicKey,
//       privateKey: extendedKey.toPrivateKey(),
//     };
//   }
// }
//
// type walletGenerator = {
//   publicKey: PublicKeyGenerator;
//   privateKey: PrivateKey;
// };