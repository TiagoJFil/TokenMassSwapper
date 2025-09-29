import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ReplicaWalletEntity } from './wallet/replica-wallet.entity';

@Entity('buy_weights_cache')
export class BuyWeightsCache {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ReplicaWalletEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'replica_wallet_address', referencedColumnName: 'address' })
  replicaWallet: ReplicaWalletEntity;

  @Column({ name: 'replica_wallet_address' })
  replicaWalletAddress: string;

  @Column({ type: 'float' })
  buyAmount: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
