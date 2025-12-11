import 'dotenv/config';
import { DataSource } from 'typeorm';

const isProduction = process.env.NODE_ENV === 'production';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number.parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'search_db',
  entities: ['src/**/*.orm-entity.ts'],
  migrations: ['src/common/database/migrations/*.ts'],
  migrationsRun: isProduction,
  synchronize: false,
  ssl: process.env.DB_SSL === 'true',
});
