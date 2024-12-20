import { Module } from '@nestjs/common';
import { UniswapService } from './uniswap.service';
import { UniswapController } from './uniswap.controller';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [CommonModule],
  providers: [UniswapService],
  controllers: [UniswapController],
})
export class UniswapV3Module {}
