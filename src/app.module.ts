import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletService } from "./services/wallet.service";
import { User } from "./model/entities/user";
import { UserWallet } from "./model/entities/wallet/userWallet";
import { AdaAppController } from './controllers/cardano/adaAppController';
import { CardanoTokenService } from './services/cardano/CardanoTokenService';
import { BlockChainService } from './services/cardano/provider/block-chain.service';
import { DexHunterService } from './services/cardano/provider/DexHunterService';
import { BlockfrostConfigProvider, DexhunterConfigProvider, NetworkProvider } from './nextjs/providers';
import { CardanoWalletProvider } from './services/cardano/provider/CardanoWalletProvider';
import { ENV } from './utils/constants';
import { UserService } from './services/user.service';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { ReplicaWallet } from './model/entities/wallet/replicaWallet';
import { DataSource } from 'typeorm';
import { Wallet } from './model/entities/wallet/wallet';
import { WalletManager } from './model/entities/walletManager';

require('dotenv').config();

@Module({
  imports: [
    TypeOrmModule.forFeature([User,UserWallet,WalletManager,ReplicaWallet,Wallet]),
  ],
  providers: [WalletService, CardanoWalletProvider,NetworkProvider],
  exports: [WalletService],
})
export class WalletModule {}


// @Module({
//   imports: [IndexerModule],
//   providers: [KasplexService, IndexerModule],
//   exports: [KasplexService]
// })
// export class KasplexModule {}
//
// @Module({
//   controllers: [KaspaAppController],
//   imports: [KasplexModule,WalletModule],
//   providers: [],
// })
// export class KaspaEndpointModule {}

@Module({
  imports: [],
  providers: [BlockfrostConfigProvider, BlockChainService],
  exports: [BlockChainService],
})
export class BlockFrostModule {}

@Module({
  imports: [],
  providers: [DexhunterConfigProvider, DexHunterService],
  exports: [DexHunterService],
})
export class DexHunterModule {}

@Module({
  imports: [BlockFrostModule, DexHunterModule],
  providers: [CardanoTokenService],
  exports: [CardanoTokenService],
})
export class CardanoModule {}

@Module({
  imports: [ TypeOrmModule.forFeature([User]),],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}

@Module({
  controllers: [AdaAppController],
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





