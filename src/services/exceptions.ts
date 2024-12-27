

//service exception
export class ServiceException extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ServiceException';
    }
}

//krc20 exception
export class KRC20Exception extends ServiceException {
    constructor(message: string) {
        super(message);
        this.name = 'KRC20Exception';
    }
}

//krc20 not found exception
export class KRC20NotFoundException extends KRC20Exception {
    constructor(ticker: string) {
        super(`KRC20 token with ticker ${ticker} not found`);
        this.name = 'KRC20NotFoundException';
    }
}

//invalid input
export class InvalidInputException extends ServiceException {
    constructor(message: string) {
        super(message);
        this.name = 'InvalidInputException';
    }
}

//invalid size for ticker
export class InvalidTickerSizeException extends InvalidInputException {
    constructor() {
        super('Invalid size for ticker, must be at least 3 characters and at most 6 characters');
        this.name = 'InvalidTickerSizeException';
    }
}
// invalid name for ticker
export class InvalidTickerNameException extends InvalidInputException {
    constructor() {
        super('Invalid ticker name, must contain only letters');
        this.name = 'InvalidTickerNameException';
    }
}

//token not mintable
export class TokenNotMintableException extends ServiceException {
    constructor(ticker: string) {
        super(`Token with ticker ${ticker} is not mintable`);
        this.name = 'TokenNotMintableException';
    }
}

//token is fully minted
export class TokenFullyMintedException extends ServiceException {
    constructor(ticker: string) {
        super(`Token with ticker ${ticker} is fully minted`);
        this.name = 'TokenFullyMintedException';
    }
}
