import { __decorate, __metadata } from "tslib";
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, JoinColumn, ManyToOne } from "typeorm";
import { IsNotEmpty } from 'class-validator';
import { ReplicaWallet } from "./wallet/replicaWallet";
let MintRequests = class MintRequests extends BaseEntity {
    id;
    wallet_address;
    amount;
    ticker;
    has_been_minted;
    created_at;
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], MintRequests.prototype, "id", void 0);
__decorate([
    JoinColumn(),
    ManyToOne(type => ReplicaWallet),
    __metadata("design:type", Object)
], MintRequests.prototype, "wallet_address", void 0);
__decorate([
    Column(),
    IsNotEmpty(),
    __metadata("design:type", Number)
], MintRequests.prototype, "amount", void 0);
__decorate([
    Column(),
    IsNotEmpty(),
    __metadata("design:type", String)
], MintRequests.prototype, "ticker", void 0);
__decorate([
    Column(),
    IsNotEmpty(),
    __metadata("design:type", Boolean)
], MintRequests.prototype, "has_been_minted", void 0);
__decorate([
    Column(),
    IsNotEmpty(),
    __metadata("design:type", Date)
], MintRequests.prototype, "created_at", void 0);
MintRequests = __decorate([
    Entity()
], MintRequests);
export { MintRequests };
