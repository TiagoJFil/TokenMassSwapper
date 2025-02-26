import {
    Entity,
    Column,
    JoinColumn,
    ManyToOne,
    type Relation, ChildEntity, ManyToMany, JoinTable,
} from 'typeorm';
import { WalletEntity } from "./wallet.entity";
import { UserEntity } from '../user.entity';
import { WalletManagerEntity } from '../wallet-manager.entity';


@Entity(
    {
        name: 'replica_wallet'
    }
)
export class ReplicaWalletEntity extends WalletEntity {

    @Column()
    index : number;

    @JoinColumn()
    @ManyToOne(() => WalletManagerEntity, manager => manager.wallets, { lazy: true })
    managed_by: Relation<WalletManagerEntity>;

    @Column()
    privateKey: string;

    @Column()
    stakePrivateKey: string;

    constructor(address: string,stake_address: string, privateKey: string, stakePrivateKey : string, index: number) {
        super(address,stake_address);
        this.privateKey = privateKey;
        this.stakePrivateKey = stakePrivateKey;
        this.index =index
    }
}
