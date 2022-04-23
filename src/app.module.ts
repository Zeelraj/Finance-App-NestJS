import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinancesModule } from './finances/finances.module';
import { LoggerMiddleware } from './utils/logger.middleware';
import { LogsModule } from './logs/logs.module';
import DatabaseLogger from './logs/databaseLogger';
import { User } from './users/users.entity';

@Module({
  imports: [
    UsersModule,
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      logger: new DatabaseLogger(),
      url: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
      entities: [User],
      synchronize: true, // This for development
      autoLoadEntities: true,
    }),
    FinancesModule,
    LogsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
