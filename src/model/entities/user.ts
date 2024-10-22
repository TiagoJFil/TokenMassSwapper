import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, PrimaryColumn, OneToOne, JoinColumn } from "typeorm";
import { IsEmail, IsNotEmpty } from 'class-validator';
import { UserWallet } from "./wallet/userWallet";

export interface userAttributes {
    id: number;
    username: string;
    password: string;
    email: string;
}

@Entity()
export class  User extends BaseEntity implements userAttributes {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @IsNotEmpty()
    username: string;

    @Column()
    @IsNotEmpty()
    password: string;

    @Column()
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @JoinColumn()
    @OneToOne(type => UserWallet)
    wallet: UserWallet;
}