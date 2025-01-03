import { KRC20TokenState } from "../services/dtos/KRC20/KRC20TokenInfoDTO";
import { TokenFullyMintedException, TokenNotMintableException } from "../services/exceptions";
export function parseDecimals(value, decimalCount) {
    return Number(value) / Math.pow(10, Number(decimalCount));
}
export function checkKRC20TokenState(state) {
    switch (state) {
        case KRC20TokenState.FINISHED:
            throw new TokenFullyMintedException("Token is fully minted");
        case KRC20TokenState.NOT_EXISTS:
            throw new TokenNotMintableException("Token does not exist");
    }
}
