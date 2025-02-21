import * as CardanoWasm from '@emurgo/cardano-serialization-lib-nodejs';
import { Responses } from '@blockfrost/blockfrost-js';
import { UTXO } from './BlockFrostConfig';
import { bech32 } from 'bech32';

export const composeTransaction = (
  address: string,
  outputAddress: string,
  outputAmount: string,
  utxos: UTXO,
  params: {
    protocolParams: Responses['epoch_param_content'];
    currentSlot: number;
  },
): {
  txHash: string;
  txBody: CardanoWasm.TransactionBody;
} => {
  if (!utxos || utxos.length === 0) {
    throw Error(`No utxo on address ${address}`); // custom error should be caught by the controller
  }

  const txBuilder = CardanoWasm.TransactionBuilder.new(
    CardanoWasm.TransactionBuilderConfigBuilder.new()
      .fee_algo(
        CardanoWasm.LinearFee.new(
          CardanoWasm.BigNum.from_str(params.protocolParams.min_fee_a.toString()),
          CardanoWasm.BigNum.from_str(params.protocolParams.min_fee_b.toString()),
        ),
      )
      .pool_deposit(CardanoWasm.BigNum.from_str(params.protocolParams.pool_deposit))
      .key_deposit(CardanoWasm.BigNum.from_str(params.protocolParams.key_deposit))
      .coins_per_utxo_byte(CardanoWasm.BigNum.from_str(params.protocolParams.coins_per_utxo_size!))
      .max_value_size(parseInt(params.protocolParams.max_val_size!))
      .max_tx_size(params.protocolParams.max_tx_size)
      .build(),
  );

  const outputAddr = CardanoWasm.Address.from_bech32(outputAddress);
  const changeAddr = CardanoWasm.Address.from_bech32(address);

  // Set TTL to +2h from currentSlot
  // If the transaction is not included in a block before that slot it will be cancelled.
  const ttl = params.currentSlot + 7200;
  txBuilder.set_ttl(ttl);

  // Add output to the tx
  txBuilder.add_output(
    CardanoWasm.TransactionOutput.new(
      outputAddr,
      CardanoWasm.Value.new(CardanoWasm.BigNum.from_str(outputAmount)),
    ),
  );

  // Filter out multi asset utxo to keep this simple
  const lovelaceUtxos = utxos.filter((u: any) => !u.amount.find((a: any) => a.unit !== 'lovelace'));

  // Create TransactionUnspentOutputs from utxos fetched from Blockfrost
  const unspentOutputs = CardanoWasm.TransactionUnspentOutputs.new();
  for (const utxo of lovelaceUtxos) {
    const amount = utxo.amount.find((a: any) => a.unit === 'lovelace')?.quantity;

    if (!amount) continue;

    const inputValue = CardanoWasm.Value.new(CardanoWasm.BigNum.from_str(amount.toString()));

    const input = CardanoWasm.TransactionInput.new(
      CardanoWasm.TransactionHash.from_bytes(Buffer.from(utxo.tx_hash, 'hex')),
      utxo.output_index,
    );
    const output = CardanoWasm.TransactionOutput.new(changeAddr, inputValue);
    unspentOutputs.add(CardanoWasm.TransactionUnspentOutput.new(input, output));
  }

  txBuilder.add_inputs_from(unspentOutputs, CardanoWasm.CoinSelectionStrategyCIP2.LargestFirst);

  // Adds a change output if there are more ADA in utxo than we need for the transaction,
  // these coins will be returned to change address
  txBuilder.add_change_if_needed(changeAddr);

  // Build transaction
  const txBody = txBuilder.build();
  const txHash = Buffer.from(CardanoWasm.hash_transaction(txBody).to_bytes()).toString('hex');

  return {
    txHash,
    txBody,
  };
};

export const signTransaction = (
  txBody: CardanoWasm.TransactionBody,
  signKey: CardanoWasm.PrivateKey,
): CardanoWasm.Transaction => {
  const txHash = CardanoWasm.hash_transaction(txBody);
  const witnesses = CardanoWasm.TransactionWitnessSet.new();
  const vkeyWitnesses = CardanoWasm.Vkeywitnesses.new();
  vkeyWitnesses.add(CardanoWasm.make_vkey_witness(txHash, signKey));

  witnesses.set_vkeys(vkeyWitnesses);

  const transaction = CardanoWasm.Transaction.new(txBody, witnesses);

  return transaction;
};

export const getSignaturesForCBOR = (
  cbor: string,
  ...keys: string[]
): string => {
  const tx = CardanoWasm.Transaction.from_bytes(Buffer.from(cbor, 'hex'));
  const txHash = CardanoWasm.hash_transaction(tx.body());
  const witnessSet = CardanoWasm.TransactionWitnessSet.new();
  const vkeyWitnesses = CardanoWasm.Vkeywitnesses.new();

  keys.forEach((key) => {
    const PrivKey = CardanoWasm.PrivateKey.from_bech32(key);
    const vkeyWitness = CardanoWasm.make_vkey_witness(txHash, PrivKey);
    vkeyWitnesses.add(vkeyWitness);
  });
  witnessSet.set_vkeys(vkeyWitnesses);
  return Buffer.from(witnessSet.to_bytes()).toString('hex');
};

export const signTransactionFromCBOR = (
  cbor: string,
  ...keys: string[]
): string => {
  const signatures = getSignaturesForCBOR(cbor, ...keys);
  const tx = CardanoWasm.Transaction.from_bytes(Buffer.from(cbor, 'hex'));
  return CardanoWasm.Transaction.new(
      tx.body(),
      CardanoWasm.TransactionWitnessSet.from_bytes(Buffer.from(signatures, 'hex')),
    ).to_hex()

}

export const bech32_encode = (data: Uint8Array, prefix: string) => {
  const words = bech32.toWords(data);
  return bech32.encode(prefix, words);
}