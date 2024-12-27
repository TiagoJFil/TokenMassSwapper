import {
    Entity,
    Column,
    OneToOne,
    JoinColumn,
    type Relation
} from "typeorm";
import { User } from "../user";
import { Wallet } from "./wallet";
import { IsNotEmpty } from "class-validator";

@Entity()
export class UserWallet extends Wallet {

    @OneToOne(() => User, user => user.wallet)
    @JoinColumn() 
    user: Relation<User>;

    @Column()
    @IsNotEmpty()
    mnemonic: string;

}
