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
import {User} from "./user";
import { ReplicaWallet } from './wallet/replicaWallet';

@Entity()
export class WalletManager extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @JoinColumn()
    @OneToOne( () => User, user => user.wallet)
    user: Relation<User>;

    @JoinColumn()
    @OneToMany(() => ReplicaWallet,
        wallet => wallet.managed_by, { cascade: true,  lazy: true })
    wallets: Relation<ReplicaWallet[]>;

    @Column({default: 0})
    @IsNotEmpty() //not the length of wallets, as wallets are just the wallets that the user has(no wallet is deleted), not the amount of replicas
    currentReplicaAmount: number;

    constructor() {
        super();
        this.currentReplicaAmount = 0;
    }
}