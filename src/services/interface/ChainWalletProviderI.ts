

export interface ChainWalletProviderI {
  generateMnemonic(): MyMnemonic;
  createUserKeyPair(mnemonic: MyMnemonic) : Promise<KeypairInfo>;
  deriveKeypair(mnemonic: MyMnemonic, walletIndex: number): Promise<KeypairInfo>;
}