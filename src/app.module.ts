import { Module } from '@nestjs/common';
import {AppController} from './controllers/app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import {KasplexService} from "./services/inscriptions/kasplexService";
import {IndexerModule} from "./services/inscriptions/Indexers";
import {WalletService} from "./services/wallet/wallet.service";
import {User} from "./model/entities/user";
import {UserWallet} from "./model/entities/wallet/userWallet";

@Module({
  imports: [IndexerModule],
  providers: [KasplexService, IndexerModule],
  exports: [KasplexService]
})
export class KasplexModule {}


@Module({

  imports: [
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([UserWallet]),
  ],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}



@Module({
  controllers: [AppController],
  imports: [TypeOrmModule.forRoot({
    type: 'postgres',
    host: '81.79.4.78',
    port: 5432,
    username: 'Malhas',
    password: 'test',
    database: 'postgres',
    autoLoadEntities: true,
    logging: true,
    entities: [__dirname + '/../entities/*{.ts,.js}',__dirname + '/../entities/**/*{.ts,.js}'],
  }),
    KasplexModule,WalletModule
  ],
  providers: [],
})
export class AppModule {}



