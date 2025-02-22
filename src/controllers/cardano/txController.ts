

//Controller for handling transactions

import { Body, Controller, Get, Injectable, Param, Post, Put } from '@nestjs/common';
import { WalletService } from '../../services/wallet.service';
import { BuyTransactionOutput, CreatedReplicasInfo, OutputDTOs, UserWalletCreateOutput } from './dto/OutputDTOs';
import { CardanoTokenService } from '../../services/cardano/CardanoTokenService';

import { Transactional } from 'typeorm-transactional';
import { ParseIntPipe } from '@nestjs/common';
import { BuyInfoOptionsInput, SellInfoOptionsInput } from './dto/InputDTOs';


@Controller("transaction")
export class TransactionController {

  constructor(private readonly walletService: WalletService,
              private readonly cardanoTokenService: CardanoTokenService) {}
  //BEFORE THIS OPERATION, a swap check has had to be called to ensure that the swap is possible
  @Post("user/:user_id/buy/:policy_id/")
  @Transactional()
  async buyTokenWithReplicas(
    @Param('user_id') userId: number,
    @Param('policy_id') policyId: string,
    @Body() buyInfoInput: BuyInfoOptionsInput,
  ): Promise<BuyTransactionOutput> {
    buyInfoInput.selfSend = buyInfoInput.selfSend || false;
    const res = await this.cardanoTokenService.multipleWalletBuyToken(
    userId,policyId, buyInfoInput.amount,{slippage: buyInfoInput.slippage,selfSend: buyInfoInput.selfSend, distribution: buyInfoInput.distribution});
    console.log("res",res);
    return new BuyTransactionOutput(null, null, null, null);
  }
  //BEFORE THIS OPERATION, a swap check has had to be called to ensure that the swap is possible
  @Post("user/:user_id/sell/:policy_id/")
  @Transactional()
  async sellTokenWithReplicas(
    @Param('user_id') userId: number,
    @Param('policy_id') policyId: string,
    @Body() sellInfoInput: SellInfoOptionsInput,
  ): Promise<BuyTransactionOutput> {

    const res = await this.cardanoTokenService.multipleWalletSellToken(
    userId,policyId, sellInfoInput.percentage,{slippage: sellInfoInput.slippage,selfSend: sellInfoInput.selfSend, distribution: sellInfoInput.distribution});

    console.log("res",res);
    return new BuyTransactionOutput(null, null, null, null);
  }



  @Post("user/:user_id/replicas/prepare")
  @Transactional()
  async prepareReplicaWallets(
    @Param('user_id') userId: number,
    @Body() replicaCount: number,
  ): Promise<CreatedReplicasInfo> {
    //const replicas = await this.walletService.setupReplicaWallets(userId, replicaCount);
    return new CreatedReplicasInfo(null);
  }


}