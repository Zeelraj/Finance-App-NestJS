import { User } from 'src/users/users.entity';
import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import CustomLogger from './customLogger';
import { ConfigModule } from '@nestjs/config';
import LogsService from './logs.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogsController } from './logs.controller';
import Log from './log.entity';
import { UsersService } from 'src/users/users.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Log]),
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: 'ah52hf0nvq8nvwyhalv84hfkxww935bfdovb20hqpg9d5gzl2g',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [CustomLogger, LogsService, UsersService],
  exports: [CustomLogger],
  controllers: [LogsController],
})
export class LogsModule {}
