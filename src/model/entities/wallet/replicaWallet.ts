
//make a wallet entity class and using typeorm looking at db.sql file
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, PrimaryColumn, OneToOne, JoinColumn, ManyToMany, ManyToOne, OneToMany } from "typeorm";

import { Wallet } from "./wallet";
import { WalletManager } from "../walletManager";
import { MintRequests } from "../mintRequests";


@Entity()
export class ReplicaWallet extends Wallet {
    
    @ManyToOne(type => WalletManager, manager => manager.wallets)
    managed_by: WalletManager;

    @Column()
    is_minting: boolean

    @JoinColumn()
    @OneToMany(type => MintRequests, mintedRequest => mintedRequest.wallet_address)
    mintedRequest: MintRequests[];
}
