import { Module } from '@nestjs/common';
import { TokenSupplyController } from './token-supply.controller';
import { TokenSupplyService } from './token-supply.service';
import { CommonModule } from 'src/common/common.module';
import { ContractService } from 'src/contract/contract.service';

@Module({
  imports: [CommonModule],
  controllers: [TokenSupplyController],
  providers: [
    TokenSupplyService,
    ContractService,
  ],
})
export class TokenSupplyModule {}
