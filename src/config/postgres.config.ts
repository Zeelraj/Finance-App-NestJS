import { User } from 'src/users/users.entity';
import DatabaseLogger from 'src/logs/databaseLogger';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const pgConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  logger: new DatabaseLogger(),
  url: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  entities: [User],
  synchronize: true, // This for development
  autoLoadEntities: true,
};
