import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config'; // Import ConfigModule and ConfigService

import { UserService } from './user/user.service';
import { BalanceService } from './balance/balance.service';
import { BalanceController } from './balance/balance.controller';
import { AllowanceController } from './allowance/allowance.controller';
import { TokenController } from './token/token.controller';
import { TokenService } from './token/token.service';
import { ApiKeyGuard } from './guards/api-key.guard';
import { RequestTrackingMiddleware } from './middlewares/request-tracking.middleware';
import { DynamicConnectionService } from './services/dynamic-connection.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AllowanceService } from './allowance/allowance.service';
import { TokenSupplyService } from './token-supply/token-supply.service';
import { TokenIDService } from './tokenId/token-id.service';
import { TokenSupplyController } from './token-supply/token-supply.controller';
import { TokenIDController } from './tokenId/token-id.controller';
import { EnsService } from './services/ens.service';
// import { EnsService } from './services/ens.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Make ConfigModule global so you don't need to import it in every module
      envFilePath: '.env', // Specify the path to the .env file (optional if you use the default .env)
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'), // Get the DATABASE_URL from the .env file
        entities: [User],
        synchronize: false, // Disable synchronize in production
      }),
    }),
    TypeOrmModule.forFeature([User]), // Register the User entity
    ThrottlerModule.forRoot([
      {
        ttl: 1000, // Time window in miliseconds
        limit: 50, // Default request limit per time window
      },
    ]),
  ],
  controllers: [
    TokenController,
    BalanceController,
    AllowanceController,
    TokenSupplyController,
    TokenIDController,
  ],
  providers: [
    EnsService,
    TokenService,
    UserService,
    BalanceService,
    AllowanceService,
    TokenSupplyService,
    TokenIDService,
    ApiKeyGuard,
    DynamicConnectionService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestTrackingMiddleware).forRoutes('*'); // Apply the middleware globally or to specific routes
  }
}
