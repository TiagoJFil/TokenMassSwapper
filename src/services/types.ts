
type Address = string;

type KeypairInfo = {
  publicKey : string,
  stakeKey :string,
  privateKey: string,
  stakePrivateKey: string
}
type MyMnemonic = string;
type PublicKeyInfo = { publicKey : string }
type PubPrivatePair = { publicKey : string, privateKey : string }



enum SWAP {
  BUY = 'buy',
  SELL = 'sell',
}

enum Distribution {
  UNIFORM = 'uniform',
  WEIGHTED = 'weighted',
}

type SwapOptionsInput = {
  slippage: number;
  selfSend?: boolean;
  distribution?: Distribution;
};