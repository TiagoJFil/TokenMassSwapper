
import { DataSource } from 'typeorm';


export const AppDataSource = new DataSource({
  ttype: 'sqlite',
  database: ':memory:',
  synchronize: true,
  logging: true,
  entities: [__dirname + '/../entities/*.entity{.ts,.js}'],
  subscribers: [],
  migrations: [],
})
