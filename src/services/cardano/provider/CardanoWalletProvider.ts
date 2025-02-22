import { Inject, Injectable } from '@nestjs/common';
import { mnemonicToEntropy,generateMnemonic } from 'bip39';
import * as CardanoWasm from '@emurgo/cardano-serialization-lib-nodejs';
import { CardanoUtils } from '../utils';
import { NESTJS } from '../../../utils/constants';
import { bech32 } from 'bech32';
import { Address, BaseAddress, RewardAddress } from '@emurgo/cardano-serialization-lib-nodejs';
import { KeypairInfo, MyMnemonic } from '../../types';

@Injectable()
export class CardanoWalletProvider {

  private network_id : number ;

  constructor(
    @Inject(NESTJS.IS_MAINNET_PROVIDER_KEY)
    is_mainnet : boolean
  ) {
    if (is_mainnet == true){
      this.network_id = CardanoWasm.NetworkInfo.mainnet().network_id()
    }else{
      this.network_id = CardanoWasm.NetworkInfo.testnet_preview().network_id()
    }
  }

  generateMnemonic(): MyMnemonic {
    return generateMnemonic();
  }
  createUserKeyPair(mnemonic: MyMnemonic): KeypairInfo {
    return this.deriveKeypair(mnemonic, 0);
  }

  deriveKeypair(
    mnemonic: MyMnemonic,
    walletIndex: number,
  ): KeypairInfo {

    const rootkey = this.getRootKeyFromSeedPhrase(mnemonic)

    const accountKey = rootkey
      .derive(CardanoUtils.harden(1852)) // purpose
      .derive(CardanoUtils.harden(1815)) // coin type
      .derive(CardanoUtils.harden(walletIndex)); // account #0

    const utxoPubKey = accountKey
      .derive(0) // external
      .derive(0)
      .to_public();

    const utxoPrivateKey = accountKey
      .derive(0) // external
      .derive(0)
      .to_raw_key();

    const stakeKey = accountKey
      .derive(2) // chimeric
      .derive(0)
      .to_public();

    const stakingPrivateKey =  accountKey
      .derive(2) // chimeric
      .derive(0)
      .to_raw_key();

    const baseAddr = CardanoWasm.BaseAddress.new(
      this.network_id,
      CardanoWasm.StakeCredential.from_keyhash(utxoPubKey.to_raw_key().hash()),
      CardanoWasm.StakeCredential.from_keyhash(stakeKey.to_raw_key().hash()),
    );

    const stake = RewardAddress.new(this.network_id, baseAddr.stake_cred())


    return { publicKey: baseAddr.to_address().to_bech32(), stakeKey: stake.to_address().to_bech32(), privateKey: utxoPrivateKey.to_bech32(), stakePrivateKey: stakingPrivateKey.to_bech32() };
  }


  private getRootKeyFromSeedPhrase(seephrase: string) {
    const entropy = mnemonicToEntropy(seephrase);
    return CardanoWasm.Bip32PrivateKey.from_bip39_entropy(
      Buffer.from(entropy, 'hex'),
      Buffer.from(''),
    );
  }


}