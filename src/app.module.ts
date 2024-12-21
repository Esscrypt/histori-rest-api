import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env`, // Load .env based on NODE_ENV
      isGlobal: true,
    }),
    CommonModule,
    // Lazy load feature modules
    forwardRef(() =>
      import('./transaction/transaction.module').then(
        (m) => m.TransactionModule,
      ),
    ),
    forwardRef(() =>
      import('./pricing/pricing.module').then((m) => m.PricingModule),
    ),
    forwardRef(() =>
      import('./allowance/allowance.module').then((m) => m.AllowanceModule),
    ),
    forwardRef(() =>
      import('./balance/balance.module').then((m) => m.BalanceModule),
    ),
    forwardRef(() => import('./chain/chain.module').then((m) => m.ChainModule)),
    forwardRef(() => import('./nft/nft.module').then((m) => m.NftModule)),
    forwardRef(() =>
      import('./token-supply/token-supply.module').then(
        (m) => m.TokenSupplyModule,
      ),
    ),
    forwardRef(() => import('./token/token.module').then((m) => m.TokenModule)),
    forwardRef(() =>
      import('./contract/contract.module').then((m) => m.ContractModule),
    ),
    forwardRef(() =>
      import('./utility/utility.module').then((m) => m.UtilityModule),
    ),
    forwardRef(() =>
      import('./uniswap/uniswap.module').then((m) => m.UniswapV3Module),
    ),
    forwardRef(() => import('./vault/vault.module').then((m) => m.VaultModule)),
    forwardRef(() =>
      import('./permit/permit.module').then((m) => m.PermitModule),
    ),
    forwardRef(() =>
      import('./compliance/compliance.module').then((m) => m.ComplianceModule),
    ),
  ],
})
export class AppModule {}
