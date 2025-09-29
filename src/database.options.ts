import { ENV } from './utils/constants';

export const AppDataSourceOptions = {
  host: process.env[ENV.DB_HOST],
  port: Number(process.env[ENV.DB_PORT]),
  username: process.env[ENV.DB_USERNAME],
  password: process.env[ENV.DB_PASSWORD],
  database: process.env[ENV.DB_DATABASE],
  logging: false,
  synchronize: true,
  entities: [__dirname + '/../entities/*{.ts,.js}', __dirname + '/../entities/**/*{.ts,.js}'],
}