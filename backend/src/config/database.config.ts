import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { ConnectedAccount } from '../entities/connected-account.entity';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'sm_automation',
  entities: [User, ConnectedAccount],
  synchronize: process.env.NODE_ENV === 'development', // auto-sync in dev, use migrations in prod
  logging: process.env.NODE_ENV === 'development',
};

