import {
    Entity,
    Column,
    JoinColumn,
    ManyToOne,
    type Relation, ChildEntity,
} from 'typeorm';
import { WalletManager } from "../walletManager";
import { Wallet } from "./wallet";


@Entity()
export class ReplicaWallet extends Wallet {

    @Column()
    index : number;

    @JoinColumn()
    @ManyToOne(() => WalletManager, manager => manager.wallets, { lazy: true })
    managed_by: Relation<WalletManager>;

    @Column()
    privateKey: string;

    constructor(address: string, privateKey: string, index: number) {
        super(address);
        this.privateKey = privateKey;
        this.index =index
    }
}
