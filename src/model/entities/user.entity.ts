import {
    Entity,
    PrimaryGeneratedColumn,
    OneToOne,
    JoinColumn,
    BaseEntity,
    type Relation, OneToMany, ManyToMany,
} from 'typeorm';
import { UserWalletEntity } from "./wallet/user-wallet.entity";
import { ReplicaWalletEntity } from './wallet/replica-wallet.entity';
import { WalletManagerEntity } from './wallet-manager.entity';

export interface userAttributes {
    id: number;
}

@Entity({
    name: 'user'
})
export class UserEntity extends BaseEntity implements userAttributes {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => UserWalletEntity, (wallet) => wallet.user,
      { cascade: true })
    @JoinColumn()
    wallet: Relation<UserWalletEntity>;

    @OneToOne(() => WalletManagerEntity, (walletManager) => walletManager.user,
      { cascade: true })
    @JoinColumn()
    walletManager: Relation<WalletManagerEntity>;

    constructor() {
        super();
    }
}