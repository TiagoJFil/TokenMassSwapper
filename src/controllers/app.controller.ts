import {Controller, Get, Injectable, Param, Post} from '@nestjs/common';
import { WalletService } from '../services/wallet/wallet.service';
import {UserWalletInfoOutput} from "./dtos/UserWalletInfoOutput";
import {KasplexService} from "../services/inscriptions/kasplexService";




@Controller()
export class AppController {
  constructor(private readonly walletService: WalletService,
              private readonly kasplexService: KasplexService) {}

  @Post("user/:user_id/wallet")
    createUserWallet(
        @Param('user_id') user_id: number
    ): Promise<string> {
        return this.walletService.createUserWallet(user_id);
    }

  @Get("user/:user_id/wallet")
  async getUserWalletInfo(
    @Param('user_id') user_id: number
  ): Promise<UserWalletInfoOutput> {
    const walletAddy = await this.walletService.getUserWalletInfo(user_id);
    const KRCBalances = await this.kasplexService.getKRC20Balances(walletAddy);
    // @ts-ignore
    return new UserWalletInfoOutput(walletAddy, KRCBalances);
  }

}
