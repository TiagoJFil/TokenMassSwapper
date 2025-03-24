
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

export type AssetInfo = {
  policyId: string,
  assetId: string,
  assetName: string,
  ticker: string
}

export type AssetInfoDTO= {
  policyId: string;
  assetName: string;
  ticker: string;
  quantity: number
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

export enum APP_NETWORK {
  MAINNET = 'mainnet',
  PREVIEW = 'preview',
  PREPROD = 'preprod',
}

export type OutputTxInfo = {assetId?: string, address: string, amount: number}

export type AdaSendInfo = {
  address: string,
  amount: number
}

export class CreateUserInput {
  platform_id: string;
  platform_name: string;
}