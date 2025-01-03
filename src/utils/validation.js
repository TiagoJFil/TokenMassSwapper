import { InvalidTickerNameException, InvalidTickerSizeException } from "../services/exceptions";
import { KRC20 } from "./constants";
export function requireTickerValid(ticker) {
    if (ticker.length < KRC20.MIN_SIZE || ticker.length > KRC20.MAX_SIZE) {
        throw new InvalidTickerSizeException();
    }
    if (!ticker.match(/^[a-zA-Z]+$/)) {
        throw new InvalidTickerNameException();
    }
}
