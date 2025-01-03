import { KRC20BalanceDTO } from "../../services/dtos/KRC20/KRC20BalanceDTO.ts";
export class UserWalletInfoOutput {
    address;
    KRCBalances;
    constructor(address, KRCBalances) {
        this.address = address;
        this.KRCBalances = KRCBalances;
    }
}
