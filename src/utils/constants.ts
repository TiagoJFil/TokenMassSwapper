
export class API{
    public static MAINNET = class {
        public static KASPLEX = 'https://api.kasplex.org';
        public static KASPA = 'api.kaspa.org';
    }
    
    public static TESTNET = class {
        public static KASPLEX = 'https://tn10api.kasplex.org';
        public static KASPA = 'api.kaspa.org';
    } 
}

export class KRC20 {
    public static MIN_SIZE = 4
    public static MAX_SIZE = 6
}

export class NESTJS {
    public static INDEXER_PROVIDER_KEY = 'INDEXER'
}