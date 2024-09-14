import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';

import { User } from './models/user.entity';
import { UserService } from './user/user.service';

import { Allowance } from './models/allowance.entity';
import { Balance } from './models/balance.entity';
import { Token } from './models/token.entity';
import { TokenID } from './models/token-id.entity';
import { TokenSupply } from './models/token-supply.entity';
import { BalanceService } from './balance/balance.service';
import { BalanceController } from './balance/balance.controller';
import { AllowanceController } from './allowance/allowance.controller';
import { TokenController } from './token/token.controller';
import { TokenService } from './token/token.service';
import { ApiKeyGuard } from './guards/api-key.guard';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'password',
      database: 'tokensdb',
      entities: [User, Balance, Allowance, Token, TokenID, TokenSupply],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Token, Balance, Allowance, User]),
    ThrottlerModule.forRoot([{
      ttl: 1,  // Time window in seconds
      limit: 5, // Default request limit per time window
  }]),
  ],
  controllers: [TokenController, BalanceController, AllowanceController],
  providers: [TokenService, UserService, ApiKeyGuard, BalanceService],
})
export class AppModule {}
