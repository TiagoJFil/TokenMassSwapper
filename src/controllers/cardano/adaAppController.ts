import {Controller, Get, Injectable, Param, Post} from '@nestjs/common';
import { WalletService } from '../../services/wallet.service';
import {UserWalletInfoOutput} from './dto/UserWalletInfoOutput';
import { CardanoTokenService } from '../../services/cardano/CardanoTokenService';
import { UserService } from '../../services/user.service';
import { UserWalletCreateOutput } from './dto/UserWalletCreateOutput';


@Controller("ada")
export class AdaAppController {
  constructor(private readonly walletService: WalletService,
              private readonly userService: UserService,
              private readonly cardanoTokenService: CardanoTokenService) {}

  @Post("user/")
  async createUserWallet(
    ): Promise<UserWalletCreateOutput> {
        const user = await this.userService.createUser();
        const userWallet = await this.walletService.createUserWallet(user.id);

        return new UserWalletCreateOutput(user.id,userWallet.address, userWallet.mnemonic);
    }

  @Get("user/:user_id/wallet")
  async getUserWalletInfo(
    @Param('user_id') user_id: number
  ): Promise<UserWalletInfoOutput> {
    const walletInfo = await this.walletService.getUserPublicWalletInfo(user_id);
    const AdaBalance = await this.cardanoTokenService.getAdaBalance(walletInfo.address);
    const tokenBalances = await this.cardanoTokenService.getTokenBalances(walletInfo.stakeKey);
    // @ts-ignore
    return new UserWalletInfoOutput(walletInfo.address,AdaBalance, tokenBalances);
  }

}
