import * as CardanoWasm from '@emurgo/cardano-serialization-lib-nodejs';
import { Responses } from '@blockfrost/blockfrost-js';
import { UTXO } from './BlockFrostConfig';
import { bech32 } from 'bech32';
import { CardanoUtils } from '../../utils';
import { OutputTxInfo } from '../../../types';

const initializeTxBuilder = (params) => {
  const builder = CardanoWasm.TransactionBuilder.new(
    CardanoWasm.TransactionBuilderConfigBuilder.new()
      .fee_algo(
        CardanoWasm.LinearFee.new(
          CardanoWasm.BigNum.from_str(
            params.protocolParams.min_fee_a.toString(),
          ),
          CardanoWasm.BigNum.from_str(
            params.protocolParams.min_fee_b.toString(),
          ),
        ),
      )
      .pool_deposit(
        CardanoWasm.BigNum.from_str(params.protocolParams.pool_deposit),
      )
      .key_deposit(
        CardanoWasm.BigNum.from_str(params.protocolParams.key_deposit),
      )
      .coins_per_utxo_byte(
        CardanoWasm.BigNum.from_str(params.protocolParams.coins_per_utxo_size!),
      )
      .max_value_size(parseInt(params.protocolParams.max_val_size!))
      .max_tx_size(params.protocolParams.max_tx_size)
      .build(),
  );
  const ttl = params.currentSlot + 7200;
  builder.set_ttl(ttl);
  return builder
};

const addOutputToTx = (
  txBuilder,
  outputAddress,
  asset = 'lovelace',
  outputAmount,
) => {
  const outputAddr = CardanoWasm.Address.from_bech32(outputAddress);

  let outputAsset;
  if (asset === 'lovelace') {
    outputAsset = CardanoWasm.Value.new(
      CardanoWasm.BigNum.from_str(
        CardanoUtils.toLovelace(outputAmount).toString(),
      ),
    );
  } else {
    outputAsset = CardanoWasm.Assets.new();
    outputAsset.insert(
      CardanoWasm.AssetName.new(Buffer.from(asset, 'hex')),
      CardanoWasm.BigNum.from_str(outputAmount.toString()),
    );
  }
  txBuilder.add_output(
    CardanoWasm.TransactionOutput.new(outputAddr, outputAsset),
  );
};

const addInputsToTx = (txBuilder, utxos, address) => {
  const changeAddr = CardanoWasm.Address.from_bech32(address);
  const lovelaceUtxos = utxos.filter(
    (u) => !u.amount.find((a) => a.unit !== 'lovelace'),
  );
  const unspentOutputs = CardanoWasm.TransactionUnspentOutputs.new();

  for (const utxo of lovelaceUtxos) {
    const amount = utxo.amount.find((a) => a.unit === 'lovelace')?.quantity;
    if (!amount) continue;

    const inputValue = CardanoWasm.Value.new(
      CardanoWasm.BigNum.from_str(amount.toString()),
    );
    const input = CardanoWasm.TransactionInput.new(
      CardanoWasm.TransactionHash.from_bytes(Buffer.from(utxo.tx_hash, 'hex')),
      utxo.output_index,
    );
    const output = CardanoWasm.TransactionOutput.new(changeAddr, inputValue);
    unspentOutputs.add(CardanoWasm.TransactionUnspentOutput.new(input, output));
  }

  txBuilder.add_inputs_from(
    unspentOutputs,
    CardanoWasm.CoinSelectionStrategyCIP2.LargestFirst,
  );


  txBuilder.add_change_if_needed(changeAddr);
};

const buildTransaction = (txBuilder) => {

  const txBody = txBuilder.build();
  const txHash = Buffer.from(
    CardanoWasm.hash_transaction(txBody).to_bytes(),
  ).toString('hex');
  return { txHash, txBody };
};

export const composeTransaction = (
  address: string,
  utxos: UTXO,
  params: {
    protocolParams: Responses['epoch_param_content'];
    currentSlot: number;
  },
  outputInfo: OutputTxInfo[],
): {
  txHash: string;
  txBody: CardanoWasm.TransactionBody;
} => {
  if (!utxos || utxos.length === 0) {
    throw Error(`No utxo on address ${address}`);
  }

  const txBuilder = initializeTxBuilder(params);
  outputInfo.forEach(({assetId, address: outAddress, amount: outputAmount}) =>
    addOutputToTx(txBuilder, outAddress, assetId ?? "lovelace", outputAmount)
  );
  addInputsToTx(txBuilder, utxos, address);
  return buildTransaction(txBuilder);
};

export const signTransaction = (
  txBody: CardanoWasm.TransactionBody,
  signKeyString: string,
): CardanoWasm.Transaction => {
  const signKey = CardanoWasm.PrivateKey.from_bech32(signKeyString);
  const txHash = CardanoWasm.hash_transaction(txBody);
  const witnesses = CardanoWasm.TransactionWitnessSet.new();
  const vkeyWitnesses = CardanoWasm.Vkeywitnesses.new();
  vkeyWitnesses.add(CardanoWasm.make_vkey_witness(txHash, signKey));

  witnesses.set_vkeys(vkeyWitnesses);

  return CardanoWasm.Transaction.new(txBody, witnesses);
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
    CardanoWasm.TransactionWitnessSet.from_bytes(
      Buffer.from(signatures, 'hex'),
    ),
  ).to_hex();
};

export const bech32_encode = (data: Uint8Array, prefix: string) => {
  const words = bech32.toWords(data);
  return bech32.encode(prefix, words);
};