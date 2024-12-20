import { Module } from '@nestjs/common';
import { AllowanceController } from './allowance.controller';
import { AllowanceService } from './allowance.service';
import { CommonModule } from 'src/common/common.module';
import { ContractService } from 'src/contract/contract.service';

@Module({
  imports: [CommonModule], // Add CommonModule to imports
  controllers: [AllowanceController],
  providers: [
    AllowanceService,
    ContractService,
  ],
})
export class AllowanceModule {}
