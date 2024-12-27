import { Indexer } from 'KasplexBuilder'
import { AppDataSource,t } from './src/model/database/database.providers'
import express from 'express'
import cors from 'cors'
import { API } from './src/utils/constants'
import { KasplexService} from './src/services/inscriptions/kasplexService'
import { WalletService } from './src/services/wallet/walletService'
import { Mnemonic } from './src/wasm/kaspa'

const app = express()
app.use(express.json())
app.use(cors())

app.get('/api/health', (req, res) => {
    res.send('OK')
})
const APP_PORT = 3000
    

function startServer(app: express.Application) {
    app.listen(APP_PORT, () => {
      console.log(`Server is running on port ${APP_PORT}`)
  })
}


// Initialize the data source
/*
AppDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!")
        startServer(app)
    })
    .catch((err) => {
        console.error("Error during Data Source initialization", err)
    })

*/
await AppDataSource.initialize();
await AppDataSource.synchronize();
//const mnemonic = Mnemonic.random(24)
//await new WalletService().createReplicaWallets(mnemonic,1)
/*
KasplexService.getInstance().getKRC20TickerInfo('racoon').then((info) => {
  console.log(info)
} ).catch((err) => {
  console.error(err)
}
)
*/
//kaspatest:qrzpnn3yjsz90nqmcp5fev2qsnzr0vjjz3z9wek4m9ttz0p42deyux3g7z0xh