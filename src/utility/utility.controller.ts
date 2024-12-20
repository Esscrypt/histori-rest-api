import { Controller, Get, Param, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';
import { EthersHelperService } from 'src/services/ethers-helper.service';

@ApiTags('Utilities')
@Controller(':network/utilities')
export class UtilityController {
  constructor(private readonly ethersHelperService: EthersHelperService) {}

  @Get('/resolve-wallet-address/:ens')
  @ApiOperation({ summary: 'Resolve ENS name to a wallet address' })
  @ApiParam({
    name: 'network',
    description: 'Blockchain network name or chain id',
    example: 'eth-mainnet',
    required: true,
  })
  @ApiQuery({
    name: 'ens',
    description: 'ENS name or wallet address',
    required: true,
  })
  async resolveWalletAddress(
    @Param('network') networkName: string,
    @Param('ens') ensName: string,
  ): Promise<string> {
    if (!networkName || !ensName) {
      throw new BadRequestException(
        'networkName and walletAddress are required',
      );
    }
    return this.ethersHelperService.resolveWalletAddress(networkName, ensName);
  }

  @Get('/avatar/:handle')
  @ApiOperation({ summary: 'Resolve Avatar by ENS name or address' })
  @ApiParam({
    name: 'network',
    description: 'Blockchain network name or chain id',
    example: 'eth-mainnet',
    required: true,
  })
  @ApiQuery({
    name: 'handle',
    description: 'ENS name or wallet address',
    required: true,
  })
  async resolveAvatar(
    @Param('network') networkName: string,
    @Param('handle') handle: string,
  ): Promise<string> {
    if (!networkName || !handle) {
      throw new BadRequestException(
        'networkName and walletAddress are required',
      );
    }
    return this.ethersHelperService.resolveAvatar(networkName, handle);
  }

  @Get('/block-timestamp/:blockNumber')
  @ApiOperation({ summary: 'Convert a block number to a timestamp' })
  @ApiParam({
    name: 'network',
    description: 'Blockchain network name or chain id',
    example: 'eth-mainnet',
    required: true,
  })
  @ApiParam({
    name: 'blockNumber',
    description: 'Block number to convert',
    required: true,
  })
  async convertBlockNumberToTimestamp(
    @Param('network') networkName: string,
    @Param('blockNumber') blockNumber: number,
  ): Promise<number> {
    if (!networkName || isNaN(blockNumber)) {
      throw new BadRequestException(
        'Valid networkName and blockNumber are required',
      );
    }
    const provider = await this.ethersHelperService.getProvider(networkName);
    return this.ethersHelperService.convertBlockNumberToTimestamp(
      blockNumber,
      provider,
    );
  }

  @Get('/block-date/:blockNumber')
  @ApiOperation({ summary: 'Convert a block number to a timestamp' })
  @ApiParam({
    name: 'network',
    description: 'Blockchain network name or chain id',
    example: 'eth-mainnet',
    required: true,
  })
  @ApiParam({
    name: 'blockNumber',
    description: 'Block number to convert',
    required: true,
  })
  async convertBlockNumberToDate(
    @Param('network') networkName: string,
    @Param('blockNumber') blockNumber: number,
  ): Promise<string> {
    if (!networkName || isNaN(blockNumber)) {
      throw new BadRequestException(
        'Valid networkName and blockNumber are required',
      );
    }
    const provider = await this.ethersHelperService.getProvider(networkName);
    return this.ethersHelperService.convertBlockNumberToDateString(
      blockNumber,
      provider,
    );
  }

  @Get('/timestamp-block/:timestamp')
  @ApiOperation({ summary: 'Convert a timestamp to a block number' })
  @ApiParam({
    name: 'network',
    description: 'Blockchain network name or chain id',
    example: 'eth-mainnet',
    required: true,
  })
  @ApiQuery({
    name: 'timestamp',
    description: 'Timestamp to convert (ISO format)',
    required: true,
  })
  async convertTimestampToBlockNumber(
    @Param('network') networkName: string,
    @Param('timestamp') timestamp: string,
  ): Promise<number> {
    if (!networkName || !timestamp) {
      throw new BadRequestException('networkName and timestamp are required');
    }
    const provider = await this.ethersHelperService.getProvider(networkName);
    return this.ethersHelperService.convertToBlockNumber(timestamp, provider);
  }
}
