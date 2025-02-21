

//enum for distribution
enum Distribution {
  UNIFORM = 'uniform',
  WEIGHTED = 'weighted',
}

export class BuyInfoOptionsInput {
  constructor(
    public amount: number,
    public slippage: number,
    public distribution: Distribution = Distribution.WEIGHTED,
    public selfSend: boolean = false,
  ) {
  }
}

export class SellInfoOptionsInput {
  constructor(
    public percentage: number,
    public slippage: number,
    public distribution: Distribution = Distribution.WEIGHTED,
    public selfSend: boolean = false,
  ) {
  }
}