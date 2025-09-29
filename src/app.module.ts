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
  NetworkProvider, SniperConfigProvider, TxSubmitterProvider,
} from './nextjs/providers';
import { BuyWeightsCache } from './model/entities/buy-weights-cache.entity';
import { WalletBuyCache } from './services/cache/WalletBuyCache';
import { DbWalletBuyCache } from './services/cache/DbWalletBuyCache';
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
import { AppDataSourceOptions } from './database.options';
import { SniperService } from './services/sniper/sniper.service';
import { SniperRequestEntity } from './model/entities/sniper-request.entity';
import { SniperController } from './controllers/cardano/sniper.controller';

require('dotenv').config();

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
  imports: [
    BlockFrostModule, 
    DexHunterModule,
    WalletModule,
    TypeOrmModule.forFeature([BuyWeightsCache]),
  ],
  providers: [
    CardanoTokenService,
    WalletBuyCache,
    DbWalletBuyCache,
  ],
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
        autoLoadEntities: true,
        ...AppDataSourceOptions
      };
    },
    async dataSourceFactory(options) {
      if (!options) {
        throw new Error('Invalid options passed');
      }

      return addTransactionalDataSource(new DataSource(options));
    },
  })],
  providers: [],
})
export class DatabaseModule {}



@Module({
  imports: [
     TypeOrmModule.forFeature([SniperRequestEntity,WalletManagerEntity])
    ],
  providers: [SniperConfigProvider,SniperService],
  controllers: [SniperController],
})
export class SniperModule {}

@Module({
  imports: [
    DatabaseModule,
    CardanoEndpointModule,
    SniperModule
  ],
  providers: [],
})
export class AppModule {}





