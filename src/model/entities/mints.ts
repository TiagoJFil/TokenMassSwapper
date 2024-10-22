
//make a wallet entity class and using typeorm looking at db.sql file
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, PrimaryColumn, OneToOne, JoinColumn } from "typeorm";
import { IsNotEmpty } from 'class-validator';
import type { Wallet } from "./wallet/wallet";
import type { ReplicaWallet } from "./wallet/replicaWallet";

export interface mintAttributes {
    id: number;
    wallet_address: ReplicaWallet;
    amount: number;
    created_at: Date;
}
@Entity()
export class  Mints extends BaseEntity implements mintAttributes {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @IsNotEmpty()
    wallet_address: ReplicaWallet;

    @Column()
    @IsNotEmpty()
    amount: number;

    @Column()
    @IsNotEmpty()
    created_at: Date;
}