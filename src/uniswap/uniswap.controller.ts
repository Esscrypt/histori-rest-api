import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiBadRequestResponse,
  ApiParam,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { GetPoolInfoDto } from 'src/dtos/request/get-pool-info.dto';
import { SupportedNetworksService } from 'src/services/supported-networks.service';
import { EthersHelperService } from 'src/services/ethers-helper.service';
import { UniswapService } from './uniswap.service';
import { UniswapV2PoolInfoResponseDto } from 'src/dtos/response/uniswap-v2-pool-info-response.dto copy';
import { UniswapV3PoolInfoResponseDto } from 'src/dtos/response/uniswap-v3-pool-info-response.dto';
// import { UniswapV4PoolInfoResponseDto } from 'src/dtos/response/uniswap-v4-pool-info-response.dto';

@ApiTags('Uniswap')
@Controller(':network/uniswap')
export class UniswapController {
  constructor(
    private readonly uniswapService: UniswapService,
    private readonly supportedNetworksService: SupportedNetworksService,
    private readonly ethersHelperService: EthersHelperService,
  ) {}

  @Get('pool-info-v2')
  @ApiOperation({ summary: 'Get Uniswap V2 pool information by pool address.' })
  @ApiResponse({
    status: 200,
    description: 'Pool information retrieved successfully.',
    type: UniswapV2PoolInfoResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid request or pool address.' })
  @ApiNotFoundResponse({ description: 'Pool not found or invalid contract.' })
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
  async getPoolInfo(
    @Param('network') networkName: string,
    @Query() dto: GetPoolInfoDto,
  ): Promise<UniswapV2PoolInfoResponseDto> {
    const { pool_address } = dto;
    const chainId = this.supportedNetworksService.getChainId(networkName);
    const provider = await this.ethersHelperService.getProvider(networkName);

    return this.uniswapService.getPoolInfoV2({
      networkName,
      chainId,
      provider,
      poolAddress: pool_address,
    });
  }

  @Get('pool-info-v3')
  @ApiOperation({ summary: 'Get Uniswap V3 pool information by pool address.' })
  @ApiResponse({
    status: 200,
    description: 'Pool information retrieved successfully.',
    type: UniswapV3PoolInfoResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid request or pool address.' })
  @ApiNotFoundResponse({ description: 'Pool not found or invalid contract.' })
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
  async getPoolInfoV3(
    @Param('network') networkName: string,
    @Query() dto: GetPoolInfoDto,
  ): Promise<UniswapV3PoolInfoResponseDto> {
    const { pool_address } = dto;
    const chainId = this.supportedNetworksService.getChainId(networkName);
    const provider = await this.ethersHelperService.getProvider(networkName);

    return this.uniswapService.getPoolInfoV3({
      networkName,
      chainId,
      provider,
      poolAddress: pool_address,
    });
  }
  // @Get('pool-info-v4')
  // @ApiOperation({ summary: 'Get Uniswap V4 pool information by pool address.' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Pool information retrieved successfully.',
  //   type: UniswapV4PoolInfoResponseDto,
  // })
  // @ApiBadRequestResponse({ description: 'Invalid request or pool address.' })
  // @ApiNotFoundResponse({ description: 'Pool not found or invalid contract.' })
  // @ApiParam({
  //   name: 'network',
  //   description: 'Blockchain network name or chain id',
  //   example: 'eth-mainnet',
  //   required: true,
  // })
  // @ApiQuery({
  //   name: 'projectId',
  //   description:
  //     'The id of your project. Can be found in your Histori dashboard.',
  //   example: '8ry9f6t9dct1se2hlagxnd9n2a',
  //   required: true,
  //   type: 'string',
  // })
  // async getPoolInfoV4(
  //   @Param('network') networkName: string,
  //   @Query() dto: GetPoolInfoDto,
  // ): Promise<UniswapV4PoolInfoResponseDto> {
  //   const { pool_address } = dto;
  //   const chainId = this.supportedNetworksService.getChainId(networkName);
  //   const provider = await this.ethersHelperService.getProvider(networkName);

  //   return this.uniswapService.getPoolInfoV4({
  //     networkName,
  //     chainId,
  //     provider,
  //     poolAddress: pool_address,
  //   });
  // }
}
