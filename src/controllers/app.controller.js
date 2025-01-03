import { __decorate, __metadata, __param } from "tslib";
import { Controller, Get, Injectable, Param, Post } from '@nestjs/common';
import { WalletService } from '../services/wallet/wallet.service.ts';
import { UserWalletInfoOutput } from "./dtos/UserWalletInfoOutput.ts";
import { KasplexService } from "../services/inscriptions/kasplexService.ts";
let AppController = class AppController {
    walletService;
    kasplexService;
    constructor(walletService, kasplexService) {
        this.walletService = walletService;
        this.kasplexService = kasplexService;
    }
    createUserWallet(user_id) {
        return this.walletService.createUserWallet(user_id);
    }
    async getUserWalletInfo(user_id) {
        const walletAddy = await this.walletService.getUserWalletInfo(user_id);
        const KRCBalances = await this.kasplexService.getKRC20Balances(walletAddy);
        // @ts-ignore
        return new UserWalletInfoOutput(walletAddy, KRCBalances);
    }
};
__decorate([
    Post("user/:user_id/wallet"),
    __param(0, Param('user_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "createUserWallet", null);
__decorate([
    Get("user/:user_id/wallet"),
    __param(0, Param('user_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getUserWalletInfo", null);
AppController = __decorate([
    Controller(),
    __metadata("design:paramtypes", [WalletService,
        KasplexService])
], AppController);
export { AppController };
