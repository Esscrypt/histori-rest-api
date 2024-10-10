import { Controller, Get, Param, Query } from '@nestjs/common';
import { BalanceService } from './balance.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { BalanceDto } from 'src/dtos/balance.dto';
import { GetSingleBalanceRequestDto } from 'src/dtos/get-single-balance-request.dto';
import { GetRangeBalanceRequestDto } from 'src/dtos/get-range-balance-request.dto';

@ApiTags('Balances')
@Controller(':network/balance')
export class BalanceController {
  constructor(private readonly balanceService: BalanceService) {}

  /**
   * Query a single balance at a specific block number or timestamp.
   */
  @Get('single')
  @ApiOperation({
    summary: 'Get balance by wallet, token, and block number or timestamp.',
  })
  @ApiResponse({
    status: 200,
    description: 'The balance data for a specific block or timestamp.',
    type: BalanceDto,
  })
  @ApiParam({
    name: 'network',
    description:
      'Blockchain network name or chain id, currently only eth-mainnet (or 1) is supported',
    example: 'eth-mainnet',
  })
  async getSingleBalance(
    @Param('network') networkName: string,
    @Query() query: GetSingleBalanceRequestDto,
  ): Promise<BalanceDto> {
    return this.balanceService.getSingleBalance(networkName, query);
  }

  /**
   * Query balances over a block range (maximum 1 day).
   */
  @Get('range')
  @ApiOperation({
    summary:
      'Get balances over a block range or time period for a given network.',
  })
  @ApiResponse({
    status: 200,
    description: 'The balances data for a range of blocks or timestamps.',
    type: [BalanceDto],
  })
  @ApiParam({
    name: 'network',
    description:
      'Blockchain network name or chain id, currently only eth-mainnet (or 1) is supported',
    example: 'eth-mainnet',
  })
  async getRangeBalances(
    @Param('version') version: string,
    @Param('network') networkName: string,
    @Query() query: GetRangeBalanceRequestDto,
  ): Promise<BalanceDto[]> {
    return this.balanceService.getRangeBalances(networkName, query);
  }
}
