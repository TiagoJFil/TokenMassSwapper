
import {Column, BaseEntity, PrimaryColumn } from "typeorm";
import { IsNotEmpty } from 'class-validator';


export abstract class Wallet extends BaseEntity {
  
    @PrimaryColumn()
    @IsNotEmpty()
    address: string;

    @Column()
    is_deleted: boolean;

    constructor(address: string) {
        super();
        this.address = address;
    }
}




