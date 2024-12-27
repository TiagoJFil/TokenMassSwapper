import {
    Entity,
    Column,
    JoinColumn,
    ManyToOne,
    OneToMany,
    type Relation
} from "typeorm";

import { Wallet } from "./wallet";
import { WalletManager } from "../walletManager";
import { MintRequests } from "../mintRequests";


@Entity()
export class ReplicaWallet extends Wallet {

    @Column()
    index : number;

    @JoinColumn()
    @ManyToOne(() => WalletManager, manager => manager.wallets)
    managed_by: Relation<WalletManager>;

    @Column()
    is_minting: boolean

    @JoinColumn()
    @OneToMany(() => MintRequests, mintedRequest => mintedRequest.wallet_address)
    mintedRequest: Relation<MintRequests[]>;

    @Column()
    privateKey: string;

}
