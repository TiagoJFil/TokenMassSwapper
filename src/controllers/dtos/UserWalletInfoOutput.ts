import {KRC20BalanceDTO} from "../../services/dtos/KRC20/KRC20BalanceDTO";


export class UserWalletInfoOutput {
    constructor(public address: string, public KRCBalances: KRC20BalanceDTO[]) {
    }
}