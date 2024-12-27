import {  IsNotEmpty } from 'class-validator';
import {BaseEntity, Column, PrimaryColumn, OneToOne, JoinColumn, OneToMany, type Relation, Entity} from "typeorm";
import { ReplicaWallet } from './wallet/replicaWallet';
import {User} from "./user.ts";

@Entity()
export class WalletManager extends BaseEntity {
    @PrimaryColumn()
    @IsNotEmpty()
    id: number;

    @Column()
    @IsNotEmpty()
    replica_count: number;

    @JoinColumn()
    @OneToOne( () => User, user => user.wallet)
    user: Relation<User>;

    @JoinColumn()
    @OneToMany(() => ReplicaWallet, wallet => wallet.managed_by)
    wallets: Relation<ReplicaWallet[]>;

}