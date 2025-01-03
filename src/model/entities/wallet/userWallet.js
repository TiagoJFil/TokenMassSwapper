import { __decorate, __metadata } from "tslib";
import { Entity, Column, OneToOne, JoinColumn } from "typeorm";
import { User } from "../user";
import { Wallet } from "./wallet";
import { IsNotEmpty } from "class-validator";
let UserWallet = class UserWallet extends Wallet {
    user;
    mnemonic;
    constructor(address, mnemonic) {
        super(address);
        this.mnemonic = mnemonic;
    }
};
__decorate([
    OneToOne(() => User, user => user.wallet, { lazy: true }),
    JoinColumn(),
    __metadata("design:type", Object)
], UserWallet.prototype, "user", void 0);
__decorate([
    Column(),
    IsNotEmpty(),
    __metadata("design:type", String)
], UserWallet.prototype, "mnemonic", void 0);
UserWallet = __decorate([
    Entity(),
    __metadata("design:paramtypes", [String, String])
], UserWallet);
export { UserWallet };
