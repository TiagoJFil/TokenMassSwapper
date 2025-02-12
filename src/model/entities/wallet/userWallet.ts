import {
    Entity,
    Column,
    OneToOne,
    JoinColumn,
    type Relation, ChildEntity,
} from 'typeorm';
import { User } from "../user";
import { Wallet } from "./wallet";
import { IsNotEmpty } from "class-validator";

@Entity()
export class UserWallet extends Wallet {

    @OneToOne(() => User, user => user.wallet, { lazy: true })
    @JoinColumn() 
    user: Relation<User>;

    @Column()
    @IsNotEmpty()
    mnemonic: string;

    constructor(address: string, mnemonic: string) {
        super(address);
        this.mnemonic = mnemonic;
    }

}
