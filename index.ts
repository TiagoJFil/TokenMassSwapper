import { Indexer } from 'KasplexBuilder'
import { AppDataSource } from './src/model/database/database.providers'
import express from 'express'
import cors from 'cors'



// create database connection then start express server
const app = express()
app.use(express.json())
app.use(cors())

AppDataSource.connect().then(() => {
  app.listen(3000, () => {
    console.log('Server is running on port 3000')
  })
}


const indexer = new Indexer(API.MAINNET.KASPLEX)

const balances = await indexer.getKRC20Balances({
  address: "kaspatest:qqg2y3d2j7za64rqfl2ttrxnn4rhta79eq7qd0eepafxannj7yv2cuamkn44r"
})