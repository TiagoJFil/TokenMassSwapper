import { __decorate, __metadata } from "tslib";
import { Entity, Column, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { Wallet } from "./wallet";
import { WalletManager } from "../walletManager";
import { MintRequests } from "../mintRequests";
let ReplicaWallet = class ReplicaWallet extends Wallet {
    index;
    managed_by;
    is_minting;
    mintedRequest;
    privateKey;
    constructor(address, privateKey, walletManager) {
        super(address);
        this.privateKey = privateKey;
        this.managed_by = walletManager;
        this.is_minting = false;
    }
};
__decorate([
    Column(),
    __metadata("design:type", Number)
], ReplicaWallet.prototype, "index", void 0);
__decorate([
    JoinColumn(),
    ManyToOne(() => WalletManager, manager => manager.wallets),
    __metadata("design:type", Object)
], ReplicaWallet.prototype, "managed_by", void 0);
__decorate([
    Column(),
    __metadata("design:type", Boolean)
], ReplicaWallet.prototype, "is_minting", void 0);
__decorate([
    JoinColumn(),
    OneToMany(() => MintRequests, mintedRequest => mintedRequest.wallet_address),
    __metadata("design:type", Object)
], ReplicaWallet.prototype, "mintedRequest", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], ReplicaWallet.prototype, "privateKey", void 0);
ReplicaWallet = __decorate([
    Entity(),
    __metadata("design:paramtypes", [String, String, WalletManager])
], ReplicaWallet);
export { ReplicaWallet };
