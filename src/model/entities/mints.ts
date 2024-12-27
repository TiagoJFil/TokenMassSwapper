import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BaseEntity,
    JoinColumn,
    type Relation, ManyToOne
} from "typeorm";
import { IsNotEmpty } from 'class-validator';
import { ReplicaWallet } from "./wallet/replicaWallet";

export interface mintAttributes {
    id: number;
    wallet_address: ReplicaWallet;
    amount: number;
    created_at: Date;
}
@Entity()
export class Mints extends BaseEntity implements mintAttributes {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => ReplicaWallet)
    @JoinColumn()
    wallet_address: Relation<ReplicaWallet>;

    @Column()
    @IsNotEmpty()
    amount: number;

    @Column()
    @IsNotEmpty()
    created_at: Date;
}