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

  constructor(amount: number, slippage: number, distribution: Distribution, selfSend: boolean) {
    this.amount = amount;
    this.slippage = slippage;
    this.distribution = distribution;
    this.selfSend = selfSend;
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