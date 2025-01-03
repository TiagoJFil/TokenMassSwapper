import { __decorate, __metadata } from "tslib";
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToOne, JoinColumn } from "typeorm";
import { IsNotEmpty } from 'class-validator';
import { UserWallet } from "./wallet/userWallet";
let User = class User extends BaseEntity {
    id;
    username;
    wallet;
    constructor(username) {
        super();
        this.username = username;
    }
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], User.prototype, "id", void 0);
__decorate([
    Column(),
    IsNotEmpty(),
    __metadata("design:type", String)
], User.prototype, "username", void 0);
__decorate([
    JoinColumn(),
    OneToOne(() => UserWallet, (wallet) => wallet.user),
    __metadata("design:type", Object)
], User.prototype, "wallet", void 0);
User = __decorate([
    Entity(),
    __metadata("design:paramtypes", [String])
], User);
export { User };
