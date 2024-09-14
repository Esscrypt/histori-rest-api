import { Controller, Get, Query } from '@nestjs/common';
import { BalanceService } from './balance.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Balances')
@Controller('balances')
export class BalanceController {
  constructor(private readonly balanceService: BalanceService) {}

  @ApiOperation({ summary: 'Get balances with filters' })
  @ApiQuery({ name: 'contractAddress', required: false, description: 'Filter by contract address' })
  @ApiQuery({ name: 'holder', required: false, description: 'Filter by holder' })
  @ApiQuery({ name: 'tokenId', required: false, description: 'Filter by tokenId' })
  @ApiQuery({ name: 'blockNumber', required: false, description: 'Filter by block number' })
  @ApiQuery({ name: 'page', required: true, description: 'Page number for pagination' })
  @ApiQuery({ name: 'limit', required: true, description: 'Limit per page' })
  @Get()
  async getBalances(
    @Query('contractAddress') contractAddress?: string,
    @Query('holder') holder?: string,
    @Query('tokenId') tokenId?: string,
    @Query('blockNumber') blockNumber?: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    return this.balanceService.getBalances(contractAddress, holder, tokenId, blockNumber, page, limit);
  }
}
