import {
    Entity,
    PrimaryGeneratedColumn,
    OneToOne,
    JoinColumn,
    BaseEntity,
    type Relation, OneToMany, ManyToMany,
} from 'typeorm';
import { UserWallet } from "./wallet/userWallet";
import { ReplicaWallet } from './wallet/replicaWallet';
import { WalletManager } from './walletManager';

export interface userAttributes {
    id: number;
}

@Entity()
export class User extends BaseEntity implements userAttributes {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => UserWallet, (wallet) => wallet.user,
      { cascade: true })
    @JoinColumn()
    wallet: Relation<UserWallet>;

    @OneToOne(() => WalletManager, (walletManager) => walletManager.user,
      { cascade: true })
    @JoinColumn()
    walletManager: Relation<WalletManager>;

    constructor() {
        super();
    }
}