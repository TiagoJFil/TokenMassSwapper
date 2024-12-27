
import { DataSource } from 'typeorm';


export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'postgres',
  autoLoadEntities: true,
  logging: true,
  entities: [__dirname + '/../entities/*{.ts,.js}',__dirname + '/../entities/**/*{.ts,.js}'],
})

