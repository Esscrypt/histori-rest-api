import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ChainService } from './chain.service';
import { GetBlockRequestDto } from 'src/dtos/request/get-block-request.dto';
import { GetGasPriceRequestDto } from 'src/dtos/request/get-gas-price.dto';
import { BlockHeightResponseDto } from 'src/dtos/response/block-heigh-response.dto';
import { GasPriceResponseDto } from 'src/dtos/response/gas-price-response.dto';
import { LogResponseDto } from 'src/dtos/response/log-response.dto';
import { GetLogsRequestDto } from 'src/dtos/request/get-logs-request.dto';
import { GetLogsEventSignatureRequestDto } from 'src/dtos/request/get-logs-event-signature-request';
import { BlockResponseDto } from 'src/dtos/response/block-response.dto';
import { BlockRangeResponseDto } from 'src/dtos/response/block-range-response.dto';
import { GetBlockRangeRequestDto } from 'src/dtos/request/get-block-range-request.dto';
import { BlockTransactionsResponseDto } from 'src/dtos/response/block-transactions-response.dto';
import { GetBlockTransactionsRequestDto } from 'src/dtos/request/get-block-transactions-request.dto';
import { TransactionService } from 'src/transaction/transaction.service';
// import { GetLogsEventSignatureRequestDto } from 'src/dtos/request/get-logs-event-signature-request';

@ApiTags('Chain')
@Controller(':network/chain')
export class ChainController {
  constructor(
    private readonly commonService: ChainService,
    private readonly transactionService: TransactionService,
  ) {}

  @Get('block-height')
  @ApiOperation({ summary: 'Get the current block height' })
  @ApiResponse({
    status: 200,
    description: 'The current block height.',
    type: BlockHeightResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Failed to fetch block height.',
  })
  @ApiParam({
    name: 'network',
    description: 'Blockchain network name or chain id',
    example: 'eth-mainnet',
  })
  @ApiQuery({
    name: 'projectId',
    description:
      'The id of your project. Can be found in your Histori dashboard.',
    example: '8ry9f6t9dct1se2hlagxnd9n2a',
    required: true,
    type: 'string',
  })
  async getBlockHeight(
    @Param('network') networkName: string,
  ): Promise<BlockHeightResponseDto> {
    return this.commonService.getBlockHeight(networkName);
  }

  @Get('gas-price')
  @ApiOperation({ summary: 'Get the current gas price' })
  @ApiResponse({
    status: 200,
    description: 'The current gas price object.',
    type: GasPriceResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Failed to fetch gas price.',
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
  async getGasPrice(
    @Param('network') networkName: string,
    @Query() dto: GetGasPriceRequestDto,
  ): Promise<GasPriceResponseDto> {
    const {
      type,
      gasLimit,
      date,
      block_height,
      transaction_to,
      transaction_from,
      transaction_amount,
      transaction_data,
      transaction,
    } = dto;
    return this.commonService.getGasPrice({
      networkName,
      type,
      gasLimit,
      date,
      block_height,
      transaction_to,
      transaction_from,
      transaction_amount,
      transaction_data,
      transaction,
    });
  }

  @Get('logs/signature')
  @ApiOperation({ summary: 'Get logs for by event signature' })
  @ApiResponse({
    status: 200,
    description: 'The logs for the specified event signature.',
  })
  @ApiBadRequestResponse({
    description: 'Failed to fetch logs.',
  })
  @ApiParam({
    name: 'network',
    description: 'Blockchain network name or chain id',
    example: 'eth-mainnet',
  })
  async getLogsByEventSignature(
    @Param('network') networkName: string,
    @Query() dto: GetLogsEventSignatureRequestDto,
  ): Promise<any> {
    const {
      start_block,
      end_block,
      block_hash,
      contract_address,
      event_signature,
    } = dto;
    // Replace 'any' with the actual type of logs
    return this.commonService.getLogsByEventSignature({
      networkName,
      start_block,
      end_block,
      block_hash,
      contract_address,
      event_signature,
    });
  }

  @Get('logs/contract/:contract_address')
  @ApiOperation({ summary: 'Get logs by contract address' })
  @ApiResponse({
    status: 200,
    description: 'The logs for the specified contract.',
    type: [LogResponseDto],
  })
  @ApiBadRequestResponse({
    description: 'Failed to fetch logs.',
  })
  @ApiParam({
    name: 'network',
    description: 'Blockchain network name or chain id',
    example: 'eth-mainnet',
  })
  @ApiParam({
    name: 'contract_address',
    description: 'Contract address to filter logs',
    example: '0x6b175474e89094c44da98b954eedeac495271d0f',
  })
  async getLogsByContractAddress(
    @Param('network') networkName: string,
    @Param('contract_address') contractAddress: string,
    @Query() query: GetLogsRequestDto,
  ): Promise<LogResponseDto> {
    // Replace 'any' with the actual type of logs
    return this.commonService.getLogsByContractAddress(
      networkName,
      contractAddress,
      query,
    );
  }

  @Get('logs')
  @ApiOperation({ summary: 'Get logs by filter' })
  @ApiResponse({
    status: 200,
    description: 'The logs for the specified filter.',
    type: Array<LogResponseDto>,
  })
  @ApiBadRequestResponse({
    description: 'Failed to fetch logs.',
  })
  @ApiParam({
    name: 'network',
    description: 'Blockchain network name or chain id',
    example: 'eth-mainnet',
  })
  async getLogs(
    @Param('network') networkName: string,
    @Query() query: GetLogsRequestDto,
  ): Promise<LogResponseDto> {
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
    type: [BlockResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Block not found.',
  })
  @ApiBadRequestResponse({
    description: 'Failed to fetch block.',
  })
  @ApiParam({
    name: 'network',
    description: 'Blockchain network name or chain id',
    example: 'eth-mainnet',
  })
  async getBlock(
    @Param('network') networkName: string,
    @Query() dto: GetBlockRequestDto,
  ): Promise<BlockResponseDto> {
    return this.commonService.getBlock(networkName, dto);
  }

  @Get('block/transactions')
  @ApiOperation({
    summary:
      'Get transactions in a block by block number or block hash on any supported network',
  })
  @ApiResponse({
    status: 200,
    description: 'The transactions in the block.',
  })
  @ApiResponse({
    status: 404,
    description: 'Block not found.',
  })
  @ApiBadRequestResponse({
    description: 'Failed to fetch block.',
  })
  @ApiParam({
    name: 'network',
    description: 'Blockchain network name or chain id',
    example: 'eth-mainnet',
  })
  async getBlockTransactions(
    @Param('network') networkName: string,
    @Query() dto: GetBlockTransactionsRequestDto,
  ): Promise<BlockTransactionsResponseDto> {
    return this.commonService.getBlockTransactions(networkName, dto);
  }

  @Get('blocks')
  @ApiOperation({
    summary:
      'Get blocks between two timestamps. Useful for building dashboards.',
  })
  @ApiParam({
    name: 'network',
    description: 'Blockchain network name or chain id',
    example: 'eth-mainnet',
    required: true,
  })
  @ApiParam({
    name: 'startDate',
    description: 'Start date in ISO format',
    required: true,
  })
  @ApiParam({
    name: 'endDate',
    description: 'End date in ISO format',
    required: true,
  })
  async getBlocksBetweenDates(
    @Param('network') networkName: string,
    @Query() dto: GetBlockRangeRequestDto,
  ): Promise<BlockRangeResponseDto> {
    return this.commonService.getBlockRange(networkName, dto);
  }
}
