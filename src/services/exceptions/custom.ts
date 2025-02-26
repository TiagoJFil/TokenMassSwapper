import { CARDANO } from '../../utils/constants';

//--------------------generic exceptions--------------------

export class ServiceException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ServiceException';
  }
}


//user has no wallet exception
export class NotFoundException extends ServiceException {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundException';
  }
}

//wallet not found exception
export class WalletNotFoundException extends NotFoundException {
  constructor(message: string) {
    super(message);
    this.name = 'WalletNotFoundException';
  }
}
// user not found
export class UserNotFoundException extends NotFoundException {
  constructor(username: string | number) {
    super(`User with id ${username} not found`);
    this.name = 'UserNotFoundException';
  }
}

//wallet manager not found exception
export class WalletManagerNotFoundException extends NotFoundException {
  constructor(message: string) {
    super(message);
    this.name = 'WalletManagerNotFoundException';
  }
}

export class NotFoundEnvVarError extends Error {
  constructor(envVar: string) {
    super(`Environment variable ${envVar} not found`)
  }
}

//--------------------blockchain services exceptions--------------------

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

export class NotEnoughFundsForDistro extends CardanoChainError {
  constructor(public address: string, public replicaCount: number, public mainBalance: number) {
    super(`The allocated funds at: ${address} are not enough to distribute between ${replicaCount} replicas,
     min ${CARDANO.INDIVIDUAL_WALLET_MIN_BALANCE * replicaCount} ADA required,
      allocated balance is only ${mainBalance} ADA`)
  }
}


