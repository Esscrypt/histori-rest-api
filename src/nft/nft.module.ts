import { Module } from '@nestjs/common';
import { NFTController } from './nft.controller';
import { NFTService } from './nft.service';
import { CommonModule } from 'src/common/common.module';
import { ContractService } from 'src/contract/contract.service';

@Module({
  imports: [CommonModule],
  controllers: [NFTController],
  providers: [NFTService, ContractService],
})
export class NftModule {}
