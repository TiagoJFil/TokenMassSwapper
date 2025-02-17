
export class OutputDTOs {
  constructor(public address: string, public ADA: string, public tokens : string) {
  }
}

export class UserWalletCreateOutput {
  constructor(public id : number,public address: string, public mnemonic: string) {
  }
}

export class CreatedReplicasInfo {
  constructor(public replicas: KeypairInfo[]) {
  }
}