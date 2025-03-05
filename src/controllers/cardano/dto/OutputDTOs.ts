import { AssetInfo, AssetInfoDTO, PublicKeyInfo } from '../../../services/types';

export class OutputDTOs {
  constructor(public address: string, public ADA: number, public tokens :  AssetInfoDTO[]) {
  }
}

export class UserWalletCreateOutput {
  constructor(public id : number,public address: string, public mnemonic: string) {
  }
}

export class CreatedReplicasInfo {
  constructor(public replicas: PublicKeyInfo[]) {
  }
}

export class BuyTransactionOutput {
  constructor(public token: string, public amount: number, public price: number, public cost: number) {
  }
}
