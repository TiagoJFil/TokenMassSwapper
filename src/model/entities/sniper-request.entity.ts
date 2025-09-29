import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';
import { WalletManagerEntity } from './wallet-manager.entity';

@Entity({
  name: 'sniper_request',
})
export class SniperRequestEntity {
  @PrimaryGeneratedColumn()
  id: number;

  walletManager: WalletManagerEntity;

  @Column({ nullable: false })
  buy_amount: number;

  @Column({ nullable: false })
  any: boolean;

  @Column({ nullable: false })
  slippage: number;

  @Column({ nullable: true })
  policyID: string;

  @Column({ nullable: true })
  ticker: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  launchType: string;

  @Column({ nullable: true })
  devPercentage: string;

  @Column({ nullable: true })
  twitter: string;

  @Column({ nullable: true })
  telegram: string;

  @Column({ nullable: true })
  discord: string;

  @Column({ nullable: true })
  website: string;


  @Column({ nullable: false, default: new Date() })
  createdAt: Date;

  @Column({ nullable: false, default: false })
  @Index()
  active: boolean;

  public constructor() {
    this.createdAt = new Date();
    this.active = true;
  }
}