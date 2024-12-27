import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BaseEntity,
    OneToOne,
    JoinColumn,
    type Relation
} from "typeorm";
import { IsNotEmpty } from 'class-validator';
import { UserWallet } from "./wallet/userWallet";

export interface userAttributes {
    id: number;
    username: string;
}

@Entity()
export class User extends BaseEntity implements userAttributes {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @IsNotEmpty()
    username: string;

    @JoinColumn()
    @OneToOne(()=> UserWallet, (wallet) => wallet.user)
    wallet: Relation<UserWallet>;

    constructor(username: string) {
        super();
        this.username = username;
    }
}