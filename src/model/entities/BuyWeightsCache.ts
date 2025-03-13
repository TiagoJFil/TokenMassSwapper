import { BuyWeightsCacheType } from 'src/services/types';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class BuyWeightsCache {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userID: number;

  @Column({ type: 'json'})
  data: BuyWeightsCacheType;
}

