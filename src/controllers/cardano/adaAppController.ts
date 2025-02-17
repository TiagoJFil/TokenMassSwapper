import { Controller, Get, Injectable, Param, Post, Put } from '@nestjs/common';
import { WalletService } from '../../services/wallet.service';
import { CreatedReplicasInfo, OutputDTOs, UserWalletCreateOutput } from './dto/OutputDTOs';
import { CardanoTokenService } from '../../services/cardano/CardanoTokenService';
import { UserService } from '../../services/user.service';
import { Transactional } from 'typeorm-transactional';
import { ParseIntPipe } from '@nestjs/common';


@Controller("ada")
export class AdaAppController {
  constructor(private readonly walletService: WalletService,
              private readonly userService: UserService,
              private readonly cardanoTokenService: CardanoTokenService) {}

  @Post("user/")
  @Transactional()
  async createUserWallet(
    ): Promise<UserWalletCreateOutput> {
        const user = await this.userService.createUser();
        const userWallet = await this.walletService.createUserWallet(user.id);

        return new UserWalletCreateOutput(user.id,userWallet.address, userWallet.mnemonic);
    }

  @Get("user/:user_id/wallet")
  async getUserWalletInfo(
    @Param('user_id',ParseIntPipe) user_id: number
  ): Promise<OutputDTOs> {
    const walletInfo = await this.walletService.getUserPublicWalletInfo(user_id);
    const AdaBalance = await this.cardanoTokenService.getAdaBalance(walletInfo.address);
    const tokenBalances = await this.cardanoTokenService.getTokenBalances(walletInfo.stakeKey);
    // @ts-ignore
    return new OutputDTOs(walletInfo.address,AdaBalance, tokenBalances);
  }

  @Put("user/:user_id/replicas/count/:count")
  async setReplicaWallets(
    @Param('user_id',ParseIntPipe) user_id: number,
    @Param('count',ParseIntPipe) count: number
  ): Promise<CreatedReplicasInfo> {
    const replicas = await this.walletService.createReplicaWallets(user_id, count);
    return new CreatedReplicasInfo(replicas);
  }

}
