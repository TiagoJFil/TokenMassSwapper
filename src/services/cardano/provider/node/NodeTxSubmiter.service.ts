import { Inject, Injectable } from '@nestjs/common';
import { NESTJS } from '../../../../utils/constants';
import errors_1 from '@blockfrost/blockfrost-js/lib/utils/errors';

@Injectable()
export class NodeTxSubmitterService implements TxSubmitter{
  constructor(
    @Inject(NESTJS.CUSTOM_NODE_API_SUBMIT_TX_ENDPOINT)
    public CUSTOM_NODE_API_SUBMIT_TX_ENDPOINT: string,
  ) {
  }

  async submitTx(transaction): Promise<string> {
    let tx;
    if (typeof transaction === 'string') {
      tx = Buffer.from(transaction, 'hex');
    }
    else {
      tx = Buffer.from(transaction);
    }
    try {
      const res = await fetch(
        this.CUSTOM_NODE_API_SUBMIT_TX_ENDPOINT,
        {
          method: 'POST',
          body: tx,
          headers: { 'Content-type': 'application/cbor' },
        },
      )

      if (res.status !== 202) {
        throw new Error('Error submitting transaction');
      }
      const response = await res.json();
      return response;
    }
    catch (error) {
      throw new Error('Error submitting transaction'); //TODO: error handling with custom errors
    }

  }
}