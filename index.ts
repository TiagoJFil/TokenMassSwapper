import { AppDataSource } from './src/model/database/database.providers'
import express from 'express'
import cors from 'cors'
import { API } from './src/utils/constants'


// Initialize the data source

AppDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!")
    })
    .catch((err) => {
        console.error("Error during Data Source initialization", err)
    })


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