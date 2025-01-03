
import {Column, BaseEntity, PrimaryColumn } from "typeorm";
import { IsNotEmpty } from 'class-validator';


export abstract class Wallet extends BaseEntity {
  
    @PrimaryColumn()
    @IsNotEmpty()
    address: string;

    @Column({ default: false })
    is_deleted: boolean;

    constructor(address: string) {
        super();
        this.is_deleted = false;
        this.address = address;
    }
}




