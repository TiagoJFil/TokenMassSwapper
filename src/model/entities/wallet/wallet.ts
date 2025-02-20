
import { Column, BaseEntity, PrimaryColumn, Entity } from 'typeorm';
import { IsNotEmpty } from 'class-validator';

@Entity()
export abstract class Wallet extends BaseEntity {
  
    @PrimaryColumn()
    @IsNotEmpty()
    address: string;

    @IsNotEmpty()
    @Column()
    stakeAddress: string;

    @Column({ default: false })
    is_deleted: boolean;

    constructor(address: string, stake_address : string) {
        super();
        this.is_deleted = false;
        this.address = address;
        this.stakeAddress = stake_address;
    }
}




