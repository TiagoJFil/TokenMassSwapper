
interface TxSubmitter {
  submitTx(transaction): Promise<string>;
}