

/**
 * create table wallet_manager(
    replica_count int not null,
    user_id int not null,
    wallet_address varchar(255) not null,
    PRIMARY KEY (wallet_address),
    FOREIGN KEY (wallet_address) REFERENCES wallet(address)
)
 */

import {  IsNotEmpty } from 'class-validator';
import { BaseEntity, Column, PrimaryColumn, OneToOne, JoinColumn, OneToMany } from "typeorm";
import { Wallet } from "./wallet/wallet";
import  { ReplicaWallet } from './wallet/replicaWallet';


export class WalletManager extends BaseEntity {
    @PrimaryColumn()
    @IsNotEmpty()
    id : number;

    @Column()
    @IsNotEmpty()
    replica_count: number;

    @Column()
    @IsNotEmpty()
    user_id: number;

    @JoinColumn()
    @OneToMany(type => ReplicaWallet, wallet => wallet.managed_by)
    wallets: ReplicaWallet;
}