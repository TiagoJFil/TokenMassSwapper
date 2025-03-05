
export class NESTJS {
    public static NETWORK_PROVIDER_KEY = 'IS_MAINNET_PROVIDER_KEY'
    public static DEXHUNTER_CONFIG_PROVIDER_KEY = 'DEXHUNTER_CONFIG'
    public static BLOCKFROST_CONFIG_PROVIDER_KEY = 'BLOCKFROST_CONFIG'
    public static TX_SUBMITTER_PROVIDER_KEY = "TX_SUBMITTER_PROVIDER_KEY";
    public static CUSTOM_NODE_API_SUBMIT_TX_ENDPOINT = "CUSTOM_NODE_API_SUBMIT_TX_ENDPOINT_PROVIDER_KEY";
}

export class CARDANO {
    public static ADA_POLICY_ID = ""
    public static INDIVIDUAL_WALLET_MIN_BALANCE = 10
}


export class TOKEN_BUY_WEIGHTS_TABLES {
    public static SIMPLE = {
        0.3: 25,
        0.2: 69,
        0.06: 100,
        0.11: 50,
        0.19: 40,
        0.14: 30
    }
}

export class TOKEN_DISTRIBUTE_WEIGHTS_TABLES {
    public static SIMPLE = {
        0.3: 36,
        0.2: 80,
        0.06: 111,
        0.11: 61,
        0.19: 51,
        0.14: 41
    }
}

export class TOKEN_BUY_HYPED_VALUES{
    public static START = 25
    public static MID = 50
    public static END = 100
}

export class ENV {
    public static BLOCKCHAIN_NETWORK = 'BLOCKCHAIN_NETWORK'
    public static DEXHUNTER_API_BASE_URL = 'DEXHUNTER_API_BASE_URL'
    public static DEXHUNTER_PARTNER_ID = 'DEXHUNTER_PARTNER_ID'
    public static BLOCKFROST_API_KEY = 'BLOCKFROST_API_KEY'
    public static DB_HOST = "DB_HOST";
    public static DB_PORT = "DB_PORT";
    public static DB_USERNAME = "DB_USERNAME" ;
    public static DB_PASSWORD = "DB_PASSWORD" ;
    public static DB_DATABASE = "DB_DATABASE" ;
    public static CUSTOM_NODE_API_SUBMIT_TX_ENDPOINT= "CUSTOM_NODE_API_SUBMIT_TX_ENDPOINT";
}