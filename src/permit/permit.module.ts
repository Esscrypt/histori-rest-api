import { Module } from '@nestjs/common';
import { PermitService } from './permit.service';
import { PermitController } from './permit.controller';
import { CommonModule } from 'src/common/common.module';
import { BalanceService } from 'src/balance/balance.service';
import { ContractService } from 'src/contract/contract.service';

@Module({
  imports: [CommonModule],
  providers: [PermitService, BalanceService, ContractService],
  controllers: [PermitController],
})
export class PermitModule {}
