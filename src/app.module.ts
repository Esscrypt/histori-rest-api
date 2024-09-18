import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
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
import { RequestTrackingMiddleware } from './middlewares/request-tracking.middleware';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [User, Balance, Allowance, Token, TokenID, TokenSupply],
      synchronize: true,  // Enable auto-migration for development
    }),
    TypeOrmModule.forFeature([Token, Balance, Allowance, User, TokenID, TokenSupply]),
    ThrottlerModule.forRoot([{
      ttl: 1000,  // Time window in miliseconds
      limit: 50, // Default request limit per time window
  }]),
  ],
  controllers: [TokenController, BalanceController, AllowanceController],
  providers: [TokenService, UserService, ApiKeyGuard, BalanceService],
})

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestTrackingMiddleware)
      .forRoutes('*');  // Apply the middleware globally or to specific routes
  }
}