
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, PrimaryColumn, OneToOne, JoinColumn, ManyToOne, ManyToMany } from "typeorm";
import { IsEmail, IsNotEmpty } from 'class-validator';
import type { Wallet } from "./wallet/wallet";
import { ReplicaWallet } from "./wallet/replicaWallet";

export interface mintRequestAttributes {
    id: number;
    wallet_address: ReplicaWallet;
    amount: number;
    ticker: string;
    has_been_minted: boolean;
    created_at: Date;
}

@Entity()
export class  MintRequests extends BaseEntity implements mintRequestAttributes {
    @PrimaryGeneratedColumn()
    id: number;

    @JoinColumn()
    @ManyToOne(type => ReplicaWallet)
    wallet_address: ReplicaWallet;

    @Column()
    @IsNotEmpty()
    amount: number;

    @Column()
    @IsNotEmpty()
    ticker: string;

    @Column()
    @IsNotEmpty()
    has_been_minted: boolean;

    @Column()
    @IsNotEmpty()
    created_at: Date;
}