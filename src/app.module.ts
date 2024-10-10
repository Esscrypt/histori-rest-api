import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config'; // Import ConfigModule and ConfigService

import { UserService } from './user/user.service';
import { BalanceService } from './balance/balance.service';
import { BalanceController } from './balance/balance.controller';
import { AllowanceController } from './allowance/allowance.controller';
import { TokenController } from './token/token.controller';
import { TokenService } from './token/token.service';
import { RequestTrackingMiddleware } from './middlewares/request-tracking.middleware';
import { DynamicConnectionService } from './services/dynamic-connection.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AllowanceService } from './allowance/allowance.service';
import { TokenSupplyService } from './token-supply/token-supply.service';
import { NFTService } from './nft/nft.service';
import { TokenSupplyController } from './token-supply/token-supply.controller';
import { NFTController } from './nft/nft.controller';
import { EnsService } from './services/ens.service';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { BalanceResolver } from './graphql/resolvers/balance.resolver';
import { HttpModule } from '@nestjs/axios';
import { AllowanceResolver } from './graphql/resolvers/allowance.resolver';
import { TokenSupplyResolver } from './graphql/resolvers/token-supply.resolver';
import { TokenResolver } from './graphql/resolvers/token.resolver';
import { EthersHelperService } from './services/ethers-helper.service';
import { CommonService } from './common/common.service';
import { CommonController } from './common/common.controller';
import { TransactionController } from './transaction/transaction.controller';
import { TransactionService } from './transaction/transaction.service';
import { UniswapV3Service } from './uniswapv3/uniswapv3.service';
import { UniswapV3Controller } from './uniswapv3/uniswapv3.controller';
import { ChainResolverService } from './services/chainresolver.service';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`, // Load .env based on NODE_ENV
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('USERS_DATABASE_URL'), // Get the DATABASE_URL from the .env file
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
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'), // Auto-generates schema
    }),
  ],
  controllers: [
    TokenController,
    BalanceController,
    AllowanceController,
    TokenSupplyController,
    NFTController,
    CommonController,
    TransactionController,
    UniswapV3Controller,
  ],
  providers: [
    UserService,

    TokenService,
    TokenResolver,

    BalanceService,
    BalanceResolver,

    AllowanceService,
    AllowanceResolver,

    TokenSupplyService,
    TokenSupplyResolver,

    NFTService,
    // TokenUriResolver,

    EnsService,
    EthersHelperService,

    DynamicConnectionService,

    CommonService,
    TransactionService,
    UniswapV3Service,
    ChainResolverService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestTrackingMiddleware).forRoutes('*'); // Apply the middleware globally or to specific routes
  }
}
