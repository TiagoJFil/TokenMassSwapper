
//make a wallet entity class and using typeorm looking at db.sql file
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, PrimaryColumn, OneToOne, JoinColumn } from "typeorm";
import { User } from "../user";
import { Wallet } from "./wallet";

@Entity()
export class UserWallet extends Wallet {

    @OneToOne(type => User)
    @JoinColumn() 
    user_id: User;


    //generate constructor
    constructor(address: string, mnemonic: string, user_id: User) {
        super(address, mnemonic);
        this.user_id = user_id;
    }
}
