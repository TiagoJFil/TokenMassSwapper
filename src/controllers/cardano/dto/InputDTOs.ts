import { IsBoolean, isEnum, IsEnum, IsInt, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { Distribution } from '../../../services/types';


export class BuyInfoOptionsInput {

  @IsInt()
  @Min(1)
  public amount: number;

  @IsNumber( { maxDecimalPlaces: 2 })
  @Max(1)
  @Min(0)
  public slippage: number;

  @IsEnum(Distribution)
  public distribution: Distribution = Distribution.WEIGHTED;

  @IsBoolean()
  @IsOptional()
  public selfSend?: boolean = false;
  
  @IsBoolean()
  @IsOptional()
  public useCache?: boolean = false;

  constructor(amount: number, slippage: number, distribution: Distribution, selfSend: boolean, useCache: boolean = false) {
    this.amount = amount;
    this.slippage = slippage;
    this.distribution = distribution;
    this.selfSend = selfSend;
    this.useCache = useCache;
  }
}

export class SellInfoOptionsInput {

  @IsNumber( { maxDecimalPlaces: 2 })
  @Max(1)
  @Min(0)
  public percentage: number;

  @IsNumber( { maxDecimalPlaces: 2 })
  @Max(1)
  @Min(0)
  public slippage: number;

  @IsEnum(Distribution)
  public distribution: Distribution = Distribution.WEIGHTED;

  @IsBoolean()
  public selfSend: boolean = false;

  constructor(percentage: number, slippage: number, distribution: Distribution, selfSend: boolean) {
    this.percentage = percentage;
    this.slippage = slippage;
    this.distribution = distribution;
    this.selfSend = selfSend;
  }
}

export class SniperSocialInputParameters {
  @IsOptional()
  public twitter: string | null = null;
  @IsOptional()
  public telegram: string | null = null;
  @IsOptional()
  public discord: string | null = null;
  @IsOptional()
  public website: string | null = null;

  constructor(twitter: string | null, telegram: string | null, discord: string | null, website: string | null) {
    this.twitter = twitter;
    this.telegram = telegram;
    this.discord = discord;
    this.website = website;
  }
}

export class SniperFilterInputParameters {
  @IsOptional()
  @IsBoolean()
  public any: boolean = false;

  @IsOptional()
  public policyID: string | null = null;

  @IsOptional()
  public ticker: string | null = null;

  @IsOptional()
  public description: string | null = null;

  @IsOptional()
  public launchType: string | null = null;

  @IsOptional()
  public devPercentage: string | null = null;

  @IsNumber ( { maxDecimalPlaces: 2 })
  @Max(1)
  @Min(0)
  public slippage: number = 0.5;

  @Min(5)
  @IsNumber( { maxDecimalPlaces: 0 })
  public buy_amount: number = 0;

  public socials: SniperSocialInputParameters;

  constructor(any: boolean, policyID: string | null, ticker: string | null, description: string | null, launchType: string | null, devPercentage: string | null, slippage: number, buy_amount: number, socials: SniperSocialInputParameters) {
    this.any = any;
    this.policyID = policyID;
    this.ticker = ticker;
    this.description = description;
    this.launchType = launchType;
    this.devPercentage = devPercentage;
    this.slippage = slippage;
    this.buy_amount = buy_amount;
    this.socials = socials;
  }
}