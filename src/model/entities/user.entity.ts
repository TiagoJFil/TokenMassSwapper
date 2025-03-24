import {
    Entity,
    PrimaryGeneratedColumn,
    OneToOne,
    JoinColumn,
    BaseEntity,
    type Relation, OneToMany, ManyToMany, PrimaryColumn,
} from 'typeorm';
import { UserWalletEntity } from "./wallet/user-wallet.entity";
import { ReplicaWalletEntity } from './wallet/replica-wallet.entity';
import { WalletManagerEntity } from './wallet-manager.entity';

export interface userAttributes {
    id: string;
}

@Entity({
    name: 'user'
})
export class UserEntity extends BaseEntity implements userAttributes {
    @PrimaryColumn()
    id: string;

    @OneToOne(() => UserWalletEntity, (wallet) => wallet.user,
      { cascade: true, eager: true })
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