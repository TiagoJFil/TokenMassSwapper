// import {Controller, Get, Injectable, Param, Post} from '@nestjs/common';
// import { WalletService } from '../../services/wallet/wallet.service';
// import {OutputDTOs} from "./dtos/OutputDTOs";
// import {KasplexService} from "../../services/kaspa/inscriptions/kasplexService";
//
//
//
//
// @Controller("kaspa")
// export class KaspaAppController {
//   constructor(private readonly walletService: WalletService,
//               private readonly kasplexService: KasplexService) {}
//
//   @Post("user/:user_id/wallet")
//     createUserWallet(
//         @Param('user_id') user_id: number
//     ): Promise<string> {
//         return this.walletService.createUserWallet(user_id);
//     }
//
//   @Get("user/:user_id/wallet")
//   async getUserWalletInfo(
//     @Param('user_id') user_id: number
//   ): Promise<OutputDTOs> {
//     const walletAddy = await this.walletService.getUserWalletInfo(user_id);
//     const KRCBalances = await this.kasplexService.getKRC20Balances(walletAddy);
//     // @ts-ignore
//     return new OutputDTOs(walletAddy, KRCBalances);
//   }
//
// }
