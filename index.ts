import { Indexer } from 'KasplexBuilder'
import { AppDataSource } from './src/model/database/database.providers'
import express from 'express'
import cors from 'cors'

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
AppDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!")
        startServer(app)
    })
    .catch((err) => {
        console.error("Error during Data Source initialization", err)
    })



/*
const indexer = new Indexer(API.MAINNET.KASPLEX)

const balances = await indexer.getKRC20Balances({
  address: "kaspatest:qqg2y3d2j7za64rqfl2ttrxnn4rhta79eq7qd0eepafxannj7yv2cuamkn44r"
})
  */