import { Finance } from './../finances/finances.entity';
import { User } from 'src/users/users.entity';
import DatabaseLogger from 'src/logs/databaseLogger';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import Log from 'src/logs/log.entity';

export const pgConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  logger: new DatabaseLogger(),
  url: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  entities: [User, Finance, Log],
  synchronize: true, // This for development
  autoLoadEntities: true,
};
