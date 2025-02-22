

//service exception
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

