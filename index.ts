import { Indexer } from 'KasplexBuilder'



const indexer = new Indexer(API.MAINNET.KASPLEX)

const balances = await indexer.getKRC20Balances({
  address: "kaspatest:qqg2y3d2j7za64rqfl2ttrxnn4rhta79eq7qd0eepafxannj7yv2cuamkn44r"
})