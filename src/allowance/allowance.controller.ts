import { Controller, Get, Query } from '@nestjs/common';
import { AllowanceService } from './allowance.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Allowances')
@Controller('allowances')
export class AllowanceController {
  constructor(private readonly allowanceService: AllowanceService) {}

  @ApiOperation({ summary: 'Get allowances with filters' })
  @ApiQuery({ name: 'contractAddress', required: false, description: 'Filter by contract address' })
  @ApiQuery({ name: 'owner', required: false, description: 'Filter by owner' })
  @ApiQuery({ name: 'spender', required: false, description: 'Filter by spender' })
  @ApiQuery({ name: 'tokenType', required: false, description: 'Filter by token type' })
  @ApiQuery({ name: 'tokenId', required: false, description: 'Filter by tokenId' })
  @ApiQuery({ name: 'blockNumber', required: false, description: 'Filter by block number' })
  @ApiQuery({ name: 'page', required: true, description: 'Page number for pagination' })
  @ApiQuery({ name: 'limit', required: true, description: 'Limit per page' })
  @Get()
  async getAllowances(
    @Query('contractAddress') contractAddress?: string,
    @Query('owner') owner?: string,
    @Query('spender') spender?: string,
    @Query('tokenType') tokenType?: string,
    @Query('tokenId') tokenId?: string,
    @Query('blockNumber') blockNumber?: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    return this.allowanceService.getAllowances(contractAddress, owner, spender, tokenType, tokenId, blockNumber, page, limit);
  }
}
