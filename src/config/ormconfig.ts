import DatabaseLogger from 'src/logs/databaseLogger';
import Log from 'src/logs/log.entity';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Finance } from './../finances/finances.entity';
import { User } from 'src/users/users.entity';

export const config: TypeOrmModuleOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  entities: [User, Finance, Log],
  migrations: ['src/migration/*{.ts,.js}'],
  cli: {
    migrationsDir: 'src/migration',
  },
  synchronize: true,
  logger: new DatabaseLogger(),
};
