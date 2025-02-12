export var KRC20TokenState;
(function (KRC20TokenState) {
    KRC20TokenState["FINISHED"] = "finished";
    KRC20TokenState["MINT_ONGOING"] = "deployed";
    KRC20TokenState["NOT_EXISTS"] = "unused";
})(KRC20TokenState || (KRC20TokenState = {}));
export class KRC20TokenInfoDTO {
    ticker;
    state;
    max;
    limit;
    preMinted;
    decimals;
    minted;
    constructor(ticker, max, limit, preMinted, decimals, minted, state) {
        this.ticker = ticker;
        this.state = state;
        this.max = Number(max);
        this.limit = Number(limit);
        this.preMinted = Number(preMinted);
        this.decimals = Number(decimals);
        this.minted = Number(minted);
    }
}
