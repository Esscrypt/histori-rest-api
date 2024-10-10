import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiParam,
} from '@nestjs/swagger';
import { UniswapV3Service } from './uniswapv3.service';

@ApiTags('UniswapV3')
@Controller(':network/uniswap')
export class UniswapV3Controller {
  constructor(private readonly uniswapV3Service: UniswapV3Service) {}

  @Get('eth-usdt-price')
  @ApiOperation({
    summary:
      'Get ETH to USDT price from Uniswap V3 pool on a specified network',
  })
  @ApiResponse({
    status: 200,
    description: 'The ETH/USDT price.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid network name.',
  })
  @ApiParam({
    name: 'network',
    description:
      'Blockchain network name or chain id, currently only eth-mainnet (or 1) is supported',
    example: 'eth-mainnet',
  })
  async getETHToUSDTPrice(
    @Param('network') networkName: string,
  ): Promise<string> {
    return this.uniswapV3Service.getETHToUSDTPrice(networkName); // Call the service with the network name
  }
}
