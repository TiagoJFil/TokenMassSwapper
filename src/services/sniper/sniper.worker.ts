// import { HotWallet, SplashApi, SplashBuilder, SplashExplorer } from '@splashprotocol/sdk';
//
// const splashApi = SplashApi({ network: 'mainnet' });
//
// const splashExplorer = SplashExplorer.new('mainnet');
//
//
// const builder = SplashBuilder(splashApi, splashExplorer);
// builder.selectWallet(() =>
//   HotWallet.fromSeed('shield chest surge million glare stadium state ride story long ice extend', splashExplorer),
// );
//
// const apirs =await splashApi.getSplashPools()
import { parentPort } from 'worker_threads';



const SNEK_NEW_TOKENS_API_URL = "https://analytics-snekfun.splash.trade/ws-http/v1/snekfun/pools-main-page/initial/state"

let last = "f4991d248bbca782301e74617dbf4b93b5741da06c239a5793757576.52454c4f4144"
//
//
// async function fetchFromDexHunter(){
//
//   const res = await fetch("https://api-us.dexhunterv3.app/swap/tokens?verified=false", {
//     "headers": {
//       "accept": "*/*",
//       "accept-language": "pt-PT,pt;q=0.8",
//       "priority": "u=1, i",
//       "sec-ch-ua": "\"Not(A:Brand\";v=\"99\", \"Brave\";v=\"133\", \"Chromium\";v=\"133\"",
//       "sec-ch-ua-mobile": "?0",
//       "sec-ch-ua-platform": "\"Windows\"",
//       "sec-fetch-dest": "empty",
//       "sec-fetch-mode": "cors",
//       "sec-fetch-site": "cross-site",
//       "sec-gpc": "1",
//       "Referer": "https://www.snek.fun/",
//       "Referrer-Policy": "strict-origin-when-cross-origin"
//     },
//     "body": null,
//     "method": "GET"
//   });
//   const data = await res.json();
//   //sort data by
// }

async function buyToken(policyID){

  const res = await fetch(`http://localhost:3031/transaction/user/1/buy/${policyID}/`, {
    "headers": {
      "accept": "*/*",
      "accept-language": "pt-PT,pt;q=0.8",
      "priority": "u=1, i",
      "sec-ch-ua": "\"Not(A:Brand\";v=\"99\", \"Brave\";v=\"133\", \"Chromium\";v=\"133\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"Windows\"",
      "Content-Type": "application/json",
    },
    "body": JSON.stringify({
      "amount": 25,
      "slippage": 1,
      "distribution": "uniform"
    }),
    "method": "POST"
  });
  const data = await res.json();
  console.log(data);

}

function checkForWantedToken(data: OutputToken) {
  if (data.info.asset !== last) {
    console.log(data);
    const initialAmount = data.pool.y.amount
    const totalAmount = 1000000000
    const percentage = totalAmount / initialAmount
    console.log("DevPercentage: ", percentage);
    const policyID = extractPolicyID(data[0].info.asset)
    buyToken(policyID)
    last = data[0].info.asset
  }
}

async function checkIfListening(): Promise<boolean> {
  // Implement the logic to check if someone is listening for data
  // This could be a database query or an API call

  return true; // Placeholder implementation
}

async function sendDataToListener(data: OutputToken) {
  // Implement the logic to send data to the listener
  // This could be an API call or a message queue
  console.log("Data sent to listener:", data);
  parentPort.postMessage(data)
}
let isFirstRun = true;

setInterval( async () => {
  //check whether somebody is listening for data (go to db table to check)
  const isListening = await checkIfListening();
  if (!isListening) return;
  //fetch data
  const data = (await fetchRecentTokens())[0]
  if (isFirstRun) {
    last = data.info.asset;
    isFirstRun = false;
    return;
  }
  //parse data according listener params
  checkForWantedToken(data)

  //send data to listener
  await sendDataToListener(data);


},Math.floor(Math.random() * 150) + 30 )

function extractPolicyID(asset: string){
  return asset.replace(".","")
}







/*

  {
    "pool": {
      "id": "63f947b8d9535bc4e4ce6919e3dc056547e8d30ada12f29aa5f826b8.2311d54037cecb26661f470b9a66d98020d2acbc9da801eab88cfb2884fc3579",
      "x": {
        "asset": ".",
        "amount": "34405944"
      },
      "y": {
        "asset": "194c735d2309e0d505067a556e4e89ec28519997e535bd8a80192739.43617264616e6f2043617420436f696e",
        "amount": "986521230"
      },
      "outputId": {
        "transactionId": "a9a18ae6bd0ff8d762156ca4d66f9f1638a8a1419a6822b853da3fcfcd1f9e0e",
        "transactionIndex": 2
      },
      "aNum": 122525779519,
      "bNum": 2545182,
      "adaCapThreshold": 18188400000,
      "poolAuthor": "6f74c02e4e0104b5d08e81eab2cb2dfca1d56fc606c8199c279dc7f2",
      "launchType": "",
      "createdOn": 1742492360,
      "permittedExecutor": "edbf33f5d6e083970648e39175c49ec1c093df76b6e6a0f1473e4776",
      "cpmmPoolId": null,
      "version": "v1",
      "timestamp": 1742498593
    },
    "metrics": {
      "marketCap": 2567442146,
      "totalVolumeAda": 481194056,
      "totalTxCount": 9,
      "crowned": null
    },
    "info": {
      "asset": "194c735d2309e0d505067a556e4e89ec28519997e535bd8a80192739.43617264616e6f2043617420436f696e",
      "ticker": "CCC",
      "logoCID": "QmQJgKXS7Wd5XpDWhQjUSM2NmES1AqPMcYNwFpkXnjMNnJ",
      "description": "I am the official Cardano Cat. The blockchain is mine.",
      "launchType": 0,
      "poolAuthor": {
        "pkh": "b2ef449a1f7d1525ba2dcee041b4f671a09cb3ab5488ca85bd8586ad",
        "skh": "6f74c02e4e0104b5d08e81eab2cb2dfca1d56fc606c8199c279dc7f2"
      },
      "socials": {
        "twitter": "https://x.com/CardanoCat116",
        "telegram": null,
        "discord": null,
        "website": "https://x.com/CardanoCat116"
      },
      "outputId": "52d480571ca3327df2f4ad83d0c33d19f815d5b2ac506ad12d5da238dd67daf8:1",
      "assetType": "Meme"
    }
  },
 */




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
