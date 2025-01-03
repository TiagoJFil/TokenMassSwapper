import { __decorate, __metadata } from "tslib";
import { IsNotEmpty } from 'class-validator';
import { BaseEntity, Column, PrimaryColumn, OneToOne, JoinColumn, OneToMany, Entity } from "typeorm";
import { ReplicaWallet } from './wallet/replicaWallet';
import { User } from "./user.ts";
let WalletManager = class WalletManager extends BaseEntity {
    id;
    replica_count;
    user;
    wallets;
};
__decorate([
    PrimaryColumn(),
    IsNotEmpty(),
    __metadata("design:type", Number)
], WalletManager.prototype, "id", void 0);
__decorate([
    Column(),
    IsNotEmpty(),
    __metadata("design:type", Number)
], WalletManager.prototype, "replica_count", void 0);
__decorate([
    JoinColumn(),
    OneToOne(() => User, user => user.wallet),
    __metadata("design:type", Object)
], WalletManager.prototype, "user", void 0);
__decorate([
    JoinColumn(),
    OneToMany(() => ReplicaWallet, wallet => wallet.managed_by),
    __metadata("design:type", Object)
], WalletManager.prototype, "wallets", void 0);
WalletManager = __decorate([
    Entity()
], WalletManager);
export { WalletManager };
