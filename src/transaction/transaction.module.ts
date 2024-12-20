import { Module } from '@nestjs/common';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { CommonModule } from 'src/common/common.module';
import { PricingService } from 'src/pricing/pricing.service';

@Module({
  imports: [CommonModule],
  controllers: [TransactionController],
  providers: [TransactionService, PricingService],
})
export class TransactionModule {}
