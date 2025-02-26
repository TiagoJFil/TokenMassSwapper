import {
    Entity,
    Column,
    OneToOne,
    JoinColumn,
    type Relation, ChildEntity,
} from 'typeorm';
import { UserEntity } from "../user.entity";
import { WalletEntity } from "./wallet.entity";
import { IsNotEmpty } from "class-validator";

@Entity(
    {
        name: 'user_wallet'
    }
)
export class UserWalletEntity extends WalletEntity {

    @OneToOne(() => UserEntity, user => user.wallet, { lazy: true })
    @JoinColumn() 
    user: Relation<UserEntity>;

    @Column()
    @IsNotEmpty()
    mnemonic: string;

    constructor(address: string,stake_address : string, mnemonic: string) {
        super(address,stake_address);
        this.mnemonic = mnemonic;
    }

}
