import {  IsNotEmpty } from 'class-validator';
import {BaseEntity, Column, PrimaryColumn, OneToOne, JoinColumn, OneToMany, type Relation, Entity} from "typeorm";
import {User} from "./user";
import { ReplicaWallet } from './wallet/replicaWallet';

@Entity()
export class WalletManager extends BaseEntity {
    @PrimaryColumn()
    @IsNotEmpty()
    id: number;

    @JoinColumn()
    @OneToOne( () => User, user => user.wallet)
    user: Relation<User>;

    @JoinColumn()
    @OneToMany(() => ReplicaWallet, wallet => wallet.managed_by)
    wallets: Relation<ReplicaWallet[]>;

    getReplicaCount(): number {
        return this.wallets.length;
    }
}