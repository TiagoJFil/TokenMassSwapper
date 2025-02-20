import {
    Entity,
    Column,
    JoinColumn,
    ManyToOne,
    type Relation, ChildEntity, ManyToMany, JoinTable,
} from 'typeorm';
import { Wallet } from "./wallet";
import { User } from '../user';
import { WalletManager } from '../walletManager';


@Entity()
export class ReplicaWallet extends Wallet {

    @Column()
    index : number;

    @JoinColumn()
    @ManyToOne(() => WalletManager, manager => manager.wallets, { lazy: true })
    managed_by: Relation<WalletManager>;

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
