import { DataSource } from 'typeorm';
import { AppDataSourceOptions } from '../../database.options';
import { SniperRequestEntity } from '../../model/entities/sniper-request.entity';
import { parentPort } from 'worker_threads';
import { WalletManagerEntity } from 'src/model/entities/wallet-manager.entity';

let appDataSource: DataSource;

const SNEK_NEW_TOKENS_API_URL = "https://analytics-snekfun.splash.trade/ws-http/v1/snekfun/pools-main-page/initial/state"
let isFirstRun = true;
let last = "";

async function intiliazeConnection() {
  appDataSource = new DataSource({
    ...AppDataSourceOptions,
    type: 'postgres',
  });
  if (!appDataSource.isInitialized) {
    await appDataSource.initialize();
  }
}

function extractPolicyID(asset: string){
  return asset.replace(".","")
}


//string may contain * for wildcard for example *hello* will match hello, hello world, world hello
function checkStringFilter(filter: string,value: string): boolean {
  if(!filter) return true;
  //check if filter is empty
  if(filter == "") return true;
  //check if filter contains wildcard
  if(filter.includes("*")){
    const regex = new RegExp(filter.replace("*",".*"))
    return regex.test(value)
  }
  return value === filter;
}
// filter may contain < or > for example <10 will match values less than 10, if >10<20 will match values between 10 and 20
//if filter is 10 it will match only 10 or 10.0 or 10.00 ...
function checkPercentageFilter(filter: string,value: number): boolean {
  if(!filter) return true;
  if(filter == "") return true;
  if(filter.includes("<") && filter.includes(">")){
    const numbers = filter.replace(">","").split("<")
    const min = parseFloat(numbers[0])
    const max = parseFloat(numbers[1])
    return value > min && value < max;
  }
  if(filter.includes("<")){
    const number = parseFloat(filter.replace("<",""))
    return value < number;
  }
  if(filter.includes(">")){
    const number = parseFloat(filter.replace(">",""))
    return value > number;
  }
  return value === parseFloat(filter);
}

function parseLaunchTypeParam(reqLaunchType: number) : LaunchType{
  return LaunchType.fromValue(reqLaunchType);
}



async function checkForWantedData(requests: SniperRequestEntity[], data: OutputToken) {
  if(requests.length == 0) return;
  const initialAmount = data.pool.y.amount
  const totalAmount = 1000000000
  const devPercentage = totalAmount / initialAmount
  console.log("DevPercentage: ", devPercentage);

  const tokenData = {
    policyID: extractPolicyID(data.info.asset),
    ticker: data.info.ticker,
    description: data.info.description,
    launchType: data.info.launchType,
    devPercentage: devPercentage,
    socials: {
      twitter: data.info.socials.twitter,
      telegram: data.info.socials.telegram,
      discord: data.info.socials.discord,
      website: data.info.socials.website
    }
  }
  console.log(tokenData)
  console.log(requests)

  const walletManagersToBuyOn =requests.map(request => {
    if(request.any){
      return {walletManager: request.walletManager, amount_to_buy: request.buy_amount};
    }
    if(!checkStringFilter(request.policyID,tokenData.policyID)){
      return;
    }
    if(!checkStringFilter(request.ticker,tokenData.ticker)){
      return;
    }
    if(!checkStringFilter(request.description,tokenData.description)){
      return;
    }
    if(parseLaunchTypeParam(Number(request.launchType)) != tokenData.launchType){
      return;
    }
    if(!checkPercentageFilter(request.devPercentage,tokenData.devPercentage)){
      return;
    }
    if(!checkStringFilter(request.twitter,tokenData.socials.twitter)){
      return;
    }
    if(!checkStringFilter(request.telegram,tokenData.socials.telegram)){
      return;
    }
    if(!checkStringFilter(request.discord,tokenData.socials.discord)){
      return;
    }
    if(!checkStringFilter(request.website,tokenData.socials.website)){
      return;
    }

    return {walletManager: request.walletManager, amount_to_buy: request.buy_amount};
  })
  return walletManagersToBuyOn;
}

async function getRequestsListening(): Promise<SniperRequestEntity[]> {
  const res = await appDataSource.query(
    `SELECT * FROM sniper_request WHERE active = true`
  )
  return res
}

async function fetchRecentTokens() : Promise<OutputToken[]>{
  const res = await fetch(SNEK_NEW_TOKENS_API_URL+"?filter=New", {
    "headers": {
      "accept": "*/*",
      "accept-language": "pt-PT,pt;q=0.8",
      "priority": "u=1, i",
      "sec-ch-ua": "\"Not(A:Brand\";v=\"99\", \"Brave\";v=\"133\", \"Chromium\";v=\"133\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"Windows\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "cross-site",
      "sec-gpc": "1",
      "Referer": "https://www.snek.fun/",
      "Referrer-Policy": "strict-origin-when-cross-origin"
    },
    "body": null,
    "method": "GET"
  })

  return res.json()
}

type PoolToken = {
  id: string;
  x: {
    asset: string;
    amount: string;
  };
  y: {
    asset: string;
    amount: number;
  };
  outputId: {
    transactionId: string;
    transactionIndex: number;
  };
  aNum: number;
  bNum: number;
  adaCapThreshold: number;
  poolAuthor: string;
  launchType: string;
  createdOn: number;
  permittedExecutor: string;
  cpmmPoolId: string | null;
  version: string;
  timestamp: number;
};

type MetricsToken = {
  marketCap: number;
  totalVolumeAda: number;
  totalTxCount: number;
  crowned: string | null;
};

type InfoToken = {
  asset: string;
  ticker: string;
  logoCID: string;
  description: string;
  launchType: number;
  poolAuthor: {
    pkh: string;
    skh: string;
  };
  socials: {
    twitter: string;
    telegram: string | null;
    discord: string | null;
    website: string;
  };
  outputId: string;
  assetType: string;
};

type OutputToken = {
  pool: PoolToken;
  metrics: MetricsToken;
  info: InfoToken;
};

type BuyReqInfo = {
  walletManager: WalletManagerEntity;
  amount_to_buy: number;
}

async function sendDataToListener(BuyReqInfo: BuyReqInfo[] ,) {
  // Implement the logic to send data to the listener
  // This could be an API call or a message queue
  console.log("Data sent to listener:", BuyReqInfo);
  parentPort.postMessage(BuyReqInfo)
}

intiliazeConnection();

const POOL_MIN_TIME = 30
const POOL_MAX_TIME = 150

setInterval( async () => {
  const requests = await getRequestsListening();
  if (!requests  || requests.length == 0) return;

  const data = (await fetchRecentTokens())[0]
  if (isFirstRun) {
    last = data.info.asset;
    isFirstRun = false;
    return;
  }
 //TODO add this if (last == data.info.asset) return;
  const walletBuyReqInfo = await checkForWantedData(requests,data)

  await sendDataToListener(walletBuyReqInfo);


},Math.floor(Math.random() * 150) + 3000 )
