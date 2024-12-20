import { Module } from '@nestjs/common';
import { UtilityController } from './utility.controller';
import { EthersHelperService } from 'src/services/ethers-helper.service';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [UtilityController],
  providers: [EthersHelperService],
})
export class UtilityModule {}
