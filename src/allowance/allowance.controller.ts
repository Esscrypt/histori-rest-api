import { Controller, Get, Param, Query } from '@nestjs/common';
import { AllowanceService } from './allowance.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { AllowanceDto } from 'src/dtos/allowance.dto';
import { GetSingleAllowanceRequestDto } from 'src/dtos/get-single-allowance-request.dto';
import { GetRangeAllowanceRequestDto } from 'src/dtos/get-range-allowance-request.dto';

@ApiTags('Allowances')
@Controller(':network/allowance')
export class AllowanceController {
  constructor(private readonly allowanceService: AllowanceService) {}

  @Get('single')
  @ApiOperation({
    summary:
      'Get allowance by owner, spender, token, and block number for a given network.',
  })
  @ApiResponse({
    status: 200,
    description: 'The allowance data.',
    type: AllowanceDto,
  })
  @ApiParam({
    name: 'network',
    description:
      'Blockchain network name or chain id, currently only eth-mainnet (or 1) is supported',
    example: 'eth-mainnet',
  })
  async getAllowance(
    @Param('network') networkName: string,
    @Query() query: GetSingleAllowanceRequestDto,
  ): Promise<AllowanceDto> {
    return this.allowanceService.getSingleAllowance(networkName, query);
  }

  /**
   * Query balances over a block range (maximum 1 day).
   */
  @Get('range')
  @ApiOperation({
    summary:
      'Get allowances over a block range or time period for a given network.',
  })
  @ApiResponse({
    status: 200,
    description: 'The allowances data for a range of blocks or timestamps.',
    type: [AllowanceDto],
  })
  @ApiParam({
    name: 'network',
    description:
      'Blockchain network name or chain id, currently only eth-mainnet (or 1) is supported',
    example: 'eth-mainnet',
  })
  async getRangeBalances(
    @Param('network') networkName: string,
    @Query() query: GetRangeAllowanceRequestDto,
  ): Promise<AllowanceDto[]> {
    return this.allowanceService.getRangeAllowances(networkName, query);
  }
}
