import { Module } from '@nestjs/common';
import { BalanceController } from './balance.controller';
import { BalanceService } from './balance.service';
import { CommonModule } from 'src/common/common.module';
import { ContractService } from 'src/contract/contract.service';

@Module({
  imports: [CommonModule], // Add CommonModule to imports
  controllers: [BalanceController],
  providers: [
    BalanceService,
    ContractService,
  ],
})
export class BalanceModule {}
