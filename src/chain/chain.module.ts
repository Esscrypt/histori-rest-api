import { Module } from '@nestjs/common';
import { ChainController } from './chain.controller';
import { ChainService } from './chain.service';
import { CommonModule } from 'src/common/common.module';
import { PricingService } from 'src/pricing/pricing.service';
import { TransactionService } from 'src/transaction/transaction.service';

@Module({
  imports: [CommonModule], // Add CommonModule to imports
  controllers: [ChainController],
  providers: [ChainService, PricingService, TransactionService],
})
export class ChainModule {}
