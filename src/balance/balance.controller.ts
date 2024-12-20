import { Controller, Get, Param, Query } from '@nestjs/common';
import { BalanceService } from './balance.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { GetSingleBalanceRequestDto } from 'src/dtos/request/get-single-balance-request.dto';
import { BalanceResponseDto } from 'src/dtos/response/balance-response.dto';
import { GetNativeBalanceRequestDto } from 'src/dtos/request/get-native-balance-request.dto';
import { NativeBalanceResponseDto } from 'src/dtos/response/native-balance-response.dto';

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
    type: BalanceResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request parameters.',
  })
  @ApiResponse({
    status: 404,
    description: 'Historical Balance does not Exist for this holder.',
  })
  @ApiParam({
    name: 'network',
    description: 'Blockchain network name or chain id',
    example: 'eth-mainnet',
    required: true,
  })
  @ApiQuery({
    name: 'projectId',
    description:
      'The id of your project. Can be found in your Histori dashboard.',
    example: '8ry9f6t9dct1se2hlagxnd9n2a',
    required: true,
    type: 'string',
  })
  async getSingleBalance(
    @Param('network') networkName: string,
    @Query() query: GetSingleBalanceRequestDto,
  ): Promise<BalanceResponseDto> {
    return this.balanceService.getSingleBalance({ networkName, ...query });
  }

  @Get('native')
  @ApiOperation({
    summary: 'Get native balance by wallet and block number or timestamp.',
  })
  @ApiResponse({
    status: 200,
    description: 'The balance data for a specific block or timestamp.',
    type: BalanceResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request parameters.',
  })
  @ApiResponse({
    status: 404,
    description: 'Historical Balance does not Exist for this holder.',
  })
  @ApiParam({
    name: 'network',
    description: 'Blockchain network name or chain id',
    example: 'eth-mainnet',
    required: true,
  })
  @ApiQuery({
    name: 'projectId',
    description:
      'The id of your project. Can be found in your Histori dashboard.',
    example: '8ry9f6t9dct1se2hlagxnd9n2a',
    required: true,
    type: 'string',
  })
  async getNativeBalance(
    @Param('network') networkName: string,
    @Query() dto: GetNativeBalanceRequestDto,
  ): Promise<NativeBalanceResponseDto> {
    return this.balanceService.getNativeBalance({ networkName, ...dto });
  }
}
