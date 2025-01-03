import { __decorate, __metadata } from "tslib";
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, JoinColumn, ManyToOne } from "typeorm";
import { IsNotEmpty } from 'class-validator';
import { ReplicaWallet } from "./wallet/replicaWallet";
let Mints = class Mints extends BaseEntity {
    id;
    wallet_address;
    amount;
    created_at;
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Mints.prototype, "id", void 0);
__decorate([
    ManyToOne(() => ReplicaWallet),
    JoinColumn(),
    __metadata("design:type", Object)
], Mints.prototype, "wallet_address", void 0);
__decorate([
    Column(),
    IsNotEmpty(),
    __metadata("design:type", Number)
], Mints.prototype, "amount", void 0);
__decorate([
    Column(),
    IsNotEmpty(),
    __metadata("design:type", Date)
], Mints.prototype, "created_at", void 0);
Mints = __decorate([
    Entity()
], Mints);
export { Mints };
