import {
    Entity,
    PrimaryGeneratedColumn,
    OneToOne,
    JoinColumn,
    BaseEntity,
    type Relation
} from "typeorm";
import { UserWallet } from "./wallet/userWallet";

export interface userAttributes {
    id: number;
}

@Entity()
export class User extends BaseEntity implements userAttributes {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => UserWallet, (wallet) => wallet.user, { cascade: true })
    @JoinColumn()
    wallet: Relation<UserWallet>;

    constructor() {
        super();
    }
}