import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletService } from "./services/wallet.service";
import { UserEntity } from "./model/entities/user.entity";
import { UserWalletEntity } from "./model/entities/wallet/user-wallet.entity";
import { WalletController } from './controllers/cardano/wallet.controller';
import { CardanoTokenService } from './services/cardano/cardano-token.service';
import { BlockChainService } from './services/cardano/provider/block-chain.service';
import { DexhunterService } from './services/cardano/provider/dexhunter.service';
import {
  BlockfrostConfigProvider, CustomNodeEndpointProvider,
  DexhunterConfigProvider,
  NetworkProvider, TxSubmitterProvider,
  WalletBuyCacheProvider,
} from './nestjs/providers';
import { CardanoWalletProviderService } from './services/cardano/provider/cardano-wallet-provider.service';
import { ENV } from './utils/constants';
import { UserService } from './services/user.service';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { ReplicaWalletEntity } from './model/entities/wallet/replica-wallet.entity';
import { DataSource } from 'typeorm';
import { WalletEntity } from './model/entities/wallet/wallet.entity';
import { WalletManagerEntity } from './model/entities/wallet-manager.entity';
import { TransactionController } from './controllers/cardano/transaction.controller';
import { NodeTxSubmitterService } from './services/cardano/provider/node/node-tx-submitter.service';
import { BlockFrostTxSubmitterService } from './services/cardano/provider/node/blockfrost-tx-submitter.service';
import { DbWalletBuyCache } from './services/cache/DbWalletBuyCache';
import { CacheEntity } from './model/entities/cache.entity';

require('dotenv').config();


@Module({
  imports: [TypeOrmModule.forFeature([CacheEntity])],
  providers: [DbWalletBuyCache,WalletBuyCacheProvider],
  exports: [WalletBuyCacheProvider,DbWalletBuyCache],
})
export class WalletBuyCacheModule {}


@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity,UserWalletEntity,WalletManagerEntity,ReplicaWalletEntity,WalletEntity]),
  ],
  providers: [WalletService, CardanoWalletProviderService,NetworkProvider],
  exports: [WalletService,CardanoWalletProviderService],
})
export class WalletModule {}


@Module({
  imports: [],
  providers: [TxSubmitterProvider,CustomNodeEndpointProvider,BlockfrostConfigProvider,
    NodeTxSubmitterService,BlockFrostTxSubmitterService],
  exports: [TxSubmitterProvider],
})
export class TxSubmitterModule {}

@Module({
  imports: [TxSubmitterModule],
  providers: [BlockfrostConfigProvider, BlockChainService],
  exports: [BlockChainService],
})
export class BlockFrostModule {}

@Module({
  imports: [TxSubmitterModule],
  providers: [DexhunterConfigProvider, DexhunterService],
  exports: [DexhunterService],
})
export class DexHunterModule {}

@Module({
  imports: [BlockFrostModule,
    DexHunterModule,
    WalletModule,
    WalletBuyCacheModule],
  providers: [CardanoTokenService,WalletBuyCacheModule],
  exports: [CardanoTokenService],
})
export class CardanoModule {}

@Module({
  imports: [ TypeOrmModule.forFeature([UserEntity]),],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}

@Module({
  controllers: [WalletController,TransactionController],
  imports: [WalletModule, CardanoModule,UserModule],
})
export class CardanoEndpointModule {}


@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory() {
        return {
          type: 'postgres',
          host: process.env[ENV.DB_HOST],
          port: Number(process.env[ENV.DB_PORT]),
          username: process.env[ENV.DB_USERNAME],
          password: process.env[ENV.DB_PASSWORD],
          database: process.env[ENV.DB_DATABASE],
          autoLoadEntities: true,
          logging: false,
          synchronize: true,
          entities: [__dirname + '/../entities/*{.ts,.js}', __dirname + '/../entities/**/*{.ts,.js}'],
        };
      },
      async dataSourceFactory(options) {
        if (!options) {
          throw new Error('Invalid options passed');
        }

        return addTransactionalDataSource(new DataSource(options));
      },
    }),
    CardanoEndpointModule
  ],
  providers: [],
})
export class AppModule {}





