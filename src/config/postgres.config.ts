import DatabaseLogger from 'src/logs/databaseLogger';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const pgConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  logger: new DatabaseLogger(),
  url: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  entities: ['dist/src/modules/*.entity.js'],
  synchronize: true,
  migrations: ['dist/src/db/migrations.js'],
  cli: { migrationsDir: 'src/db/migrations' },
};
