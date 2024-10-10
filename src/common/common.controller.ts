import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiParam,
} from '@nestjs/swagger';
import { CommonService } from './common.service';
import { GetLogsRequestDto } from 'src/dtos/get-logs-request.dto';
import { GetBlockRequestDto } from 'src/dtos/get-block-request.dto';
import { GetGasPriceRequestDto } from 'src/dtos/get-gas-price.dto';

@ApiTags('Common')
@Controller(':network/common')
export class CommonController {
  constructor(private readonly commonService: CommonService) {}

  @Get('block-height')
  @ApiOperation({ summary: 'Get the current block height' })
  @ApiResponse({
    status: 200,
    description: 'The current block height.',
  })
  @ApiBadRequestResponse({
    description: 'Failed to fetch block height.',
  })
  @ApiParam({
    name: 'network',
    description:
      'Blockchain network name or chain id, currently only eth-mainnet (or 1) is supported',
    example: 'eth-mainnet',
  })
  async getBlockHeight(@Param('network') networkName: string): Promise<number> {
    return this.commonService.getBlockHeight(networkName);
  }

  @Get('gas-price')
  @ApiOperation({ summary: 'Get the current gas price' })
  @ApiResponse({
    status: 200,
    description: 'The current gas price in Gwei.',
  })
  @ApiBadRequestResponse({
    description: 'Failed to fetch gas price.',
  })
  @ApiParam({
    name: 'network',
    description:
      'Blockchain network name or chain id, currently only eth-mainnet (or 1) is supported',
    example: 'eth-mainnet',
  })
  async getGasPrice(
    @Param('network') networkName: string,
    @Param() dto: GetGasPriceRequestDto,
  ): Promise<string> {
    return this.commonService.getGasPrice(networkName, dto);
  }

  @Get('logs')
  @ApiOperation({ summary: 'Get logs for a contract address' })
  @ApiResponse({
    status: 200,
    description: 'The logs for the specified contract.',
  })
  @ApiBadRequestResponse({
    description: 'Failed to fetch logs.',
  })
  @ApiParam({
    name: 'network',
    description:
      'Blockchain network name or chain id, currently only eth-mainnet (or 1) is supported',
    example: 'eth-mainnet',
  })
  async getLogs(
    @Param('network') networkName: string,
    @Query() query: GetLogsRequestDto,
  ): Promise<any> {
    // Replace 'any' with the actual type of logs
    return this.commonService.getLogs(networkName, query);
  }

  @Get('block')
  @ApiOperation({
    summary:
      'Get a block by block number or block hash on any supported network',
  })
  @ApiResponse({
    status: 200,
    description: 'The block details.',
  })
  @ApiBadRequestResponse({
    description: 'Failed to fetch block.',
  })
  @ApiParam({
    name: 'network',
    description:
      'Blockchain network name or chain id, currently only eth-mainnet (or 1) is supported',
    example: 'eth-mainnet',
  })
  async getBlock(
    @Param('network') networkName: string,
    @Param() dto: GetBlockRequestDto,
  ): Promise<any> {
    // Replace 'any' with the actual type of block
    return this.commonService.getBlock(networkName, dto);
  }
}
