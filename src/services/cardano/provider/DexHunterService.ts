import { DtoSwapResponse, SwapApiFactory, SwapApiFactoryType } from './dexhunter/api';
import { Configuration } from "./dexhunter/DexHunterSDK";
import  AxiosFetchAPI  from './dexhunter/AxiosFetchApi';
import { Inject, Injectable } from '@nestjs/common';
import { NESTJS } from "src/utils/constants";

@Injectable()
export class DexHunterService {
    private swapApi: SwapApiFactoryType

    ADA_POLICY_ID ="" // empty for whatever reason

    constructor(
      @Inject(NESTJS.DEXHUNTER_CONFIG_PROVIDER_KEY)
      configuration: Configuration
    ) {
      this.swapApi = SwapApiFactory(configuration, AxiosFetchAPI ,configuration.basePath);
      
    }

    async buyToken(buyerAddress,policyID, amount :number) {
      //call the buildSwap function from the swapApi
      const res : DtoSwapResponse = await this.swapApi.swapBuildPost({
        buyerAddress: buyerAddress,
        amountIn: amount,
        tokenIn: "",
        tokenOut: policyID,
        txOptimization: true,
        referrer: "ParaSwap",
        blacklistedDexes: [],
        slippage: 0.5, //TODO: review this value
      })


      this.swapApi.swapSignPost({

      })


    }
}