import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { FinancesService } from './finances.service';
import { FinancesController } from './finances.controller';
import { Finance } from './finances.entity';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/users.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Finance]),
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: 'ah52hf0nvq8nvwyhalv84hfkxww935bfdovb20hqpg9d5gzl2g',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [FinancesService, UsersService],
  controllers: [FinancesController],
})
export class FinancesModule {}
