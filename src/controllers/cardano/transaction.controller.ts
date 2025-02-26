

//Controller for handling transactions

import { Body, Controller, Param, Post, Query } from '@nestjs/common';
import { WalletService } from '../../services/wallet.service';
import { BuyTransactionOutput, CreatedReplicasInfo, OutputDTOs, UserWalletCreateOutput } from './dto/OutputDTOs';
import { CardanoTokenService } from '../../services/cardano/cardano-token.service';

import { Transactional } from 'typeorm-transactional';
import { ParseIntPipe } from '@nestjs/common';
import { BuyInfoOptionsInput, SellInfoOptionsInput } from './dto/InputDTOs';
import { Distribution } from '../../services/types';


@Controller("transaction")
export class TransactionController {

  constructor(private readonly walletService: WalletService,
              private readonly cardanoTokenService: CardanoTokenService) {}
  //BEFORE THIS OPERATION, a swap check has had to be called to ensure that the swap is possible
  @Post("user/:user_id/buy/:policy_id/")
  @Transactional()
  async buyTokenWithReplicas(
    @Param('user_id',ParseIntPipe) userId: number,
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
    @Param('user_id',ParseIntPipe) userId: number,
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
    @Param('user_id',ParseIntPipe) userId: number,
    @Query('amount',ParseIntPipe) mainWalletAllocatedAmount: number,
    @Query('distribution') distribution: Distribution,
  ): Promise<any> {
    const balances = await this.cardanoTokenService.distributeAdaToReplicas(userId,mainWalletAllocatedAmount, distribution);
    return balances
  }


}