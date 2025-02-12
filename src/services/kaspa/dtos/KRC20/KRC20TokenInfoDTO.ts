
export enum KRC20TokenState {
    FINISHED = "finished",
    MINT_ONGOING = "deployed",
    NOT_EXISTS = "unused"
}
export type KRC20TokenInfoDTOType = {
    ticker: string;
    max: number;
    limit: number;
    preMinted: number;
    decimals: number;
    minted: number;
    state: KRC20TokenState;
}

export class KRC20TokenInfoDTO implements KRC20TokenInfoDTOType {
    public state : KRC20TokenState;
    public max: number;
    public limit: number;
    public preMinted: number; 
    public decimals: number; 
    public minted: number;

    constructor(
        public ticker: string,
        max: number | string,
        limit: number | string, 
        preMinted: number | string, 
        decimals: number | string, 
        minted: number | string, 
        state: string,
    ) {
        this.state = state as KRC20TokenState;
        this.max = Number(max);
        this.limit = Number(limit);
        this.preMinted = Number(preMinted);
        this.decimals = Number(decimals);
        this.minted = Number(minted);
    
    }

}