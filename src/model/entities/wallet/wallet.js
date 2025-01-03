import { __decorate, __metadata } from "tslib";
import { Column, BaseEntity, PrimaryColumn } from "typeorm";
import { IsNotEmpty } from 'class-validator';
export class Wallet extends BaseEntity {
    address;
    is_deleted;
    constructor(address) {
        super();
        this.is_deleted = false;
        this.address = address;
    }
}
__decorate([
    PrimaryColumn(),
    IsNotEmpty(),
    __metadata("design:type", String)
], Wallet.prototype, "address", void 0);
__decorate([
    Column({ default: false }),
    __metadata("design:type", Boolean)
], Wallet.prototype, "is_deleted", void 0);
