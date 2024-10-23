
//make a wallet entity class and using typeorm looking at db.sql file
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, PrimaryColumn, OneToOne, JoinColumn } from "typeorm";
import { IsNotEmpty } from 'class-validator';


@Entity()
export abstract  class Wallet extends BaseEntity {
  
    @PrimaryColumn()
    @IsNotEmpty()
    address: string;

    @Column()
    @IsNotEmpty()
    mnemonic: string;

    @Column()
    is_deleted: boolean;

    //generate constructor
    constructor(address: string, mnemonic: string) {
        super();
        this.address = address;
        this.mnemonic = mnemonic;
    }
}




