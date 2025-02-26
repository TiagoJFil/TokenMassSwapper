import { IsNotEmpty } from 'class-validator';
import {
    BaseEntity,
    Column,
    PrimaryColumn,
    OneToOne,
    JoinColumn,
    OneToMany,
    type Relation,
    Entity,
    PrimaryGeneratedColumn,
} from 'typeorm';
import {UserEntity} from "./user.entity";
import { ReplicaWalletEntity } from './wallet/replica-wallet.entity';

@Entity(
    {
        name: 'wallet_manager'
    }
)
export class WalletManagerEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @JoinColumn()
    @OneToOne( () => UserEntity, user => user.wallet)
    user: Relation<UserEntity>;

    @JoinColumn()
    @OneToMany(() => ReplicaWalletEntity,
        wallet => wallet.managed_by, { cascade: true,  lazy: true })
    wallets: Relation<ReplicaWalletEntity[]>;

    @Column({default: 0})
    @IsNotEmpty() //not the length of wallets, as wallets are just the wallets that the user has(no wallet is deleted), not the amount of replicas
    currentReplicaAmount: number;

    constructor() {
        super();
        this.currentReplicaAmount = 0;
    }
}