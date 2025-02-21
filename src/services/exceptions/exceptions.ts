

export class NotFoundEnvVarError extends Error {
  constructor(envVar: string) {
    super(`Environment variable ${envVar} not found`)
  }
}

export class CardanoChainError extends Error {
  constructor(message: string) {
    super(message)
  }
}

export class DexHunterApiError extends Error {
  constructor(message: string) {
    super(message)
  }
}
//may or not be the real motive as their api throws this error when a lot of things go wrong
export class NotEnoughFundsDexHunterError extends DexHunterApiError {
  constructor(public address: string) {
    super('Not enough funds in the given address')
  }
}

export class InternalDexhunterError extends DexHunterApiError {
  constructor(public message: string) {
    super(`Internal Dexhunter error: ${message}`)
  }
}

export class NoUtxFoundError extends CardanoChainError {
  constructor(public address: string) {
    super(`No UTX found for the given address: ${address}`)
  }
}

export class NotEnoughFunds extends CardanoChainError {
  constructor(public address: string) {
    super(`Not enough funds in the given address: ${address}`)
  }
}

