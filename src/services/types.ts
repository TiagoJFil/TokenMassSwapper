
export type Address = string;

export type KeypairInfo = {
  publicKey : string,
  stakeKey :string,
  privateKey: string,
  stakePrivateKey: string
}
export type MyMnemonic = string;
export type PublicKeyInfo = { publicKey : string }
export type PubPrivatePair = { publicKey : string, privateKey : string }

export type PublicWalletInfo = {
    address: string,
    stakeKey: string
}


export enum SWAP {
  BUY = 'buy',
  SELL = 'sell',
}

export enum Distribution {
  UNIFORM = 'uniform',
  WEIGHTED = 'weighted',
}

export type SwapOptionsInput = {
  slippage: number;
  selfSend?: boolean;
  distribution?: Distribution;
};