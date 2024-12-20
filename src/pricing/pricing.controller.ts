import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { PricingService } from './pricing.service';
import { UniswapPriceInfoResponseDto } from 'src/dtos/response/uniswap-eth-usd-price-info-response.dto';
import { BlockHeightOrDateDto } from 'src/dtos/block-height-or-date.dto';

@ApiTags('Pricing')
@Controller(':network/pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Get('native-usd-price')
  @ApiOperation({
    summary: 'Get Network native token to USD price on a specified network',
  })
  @ApiResponse({
    status: 200,
    description: 'The ETH/USDT price.',
    type: UniswapPriceInfoResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid network name.',
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
  async getNativeToUSDPrice(
    @Param('network') networkName: string,
    @Query() dto: BlockHeightOrDateDto,
  ): Promise<UniswapPriceInfoResponseDto> {
    return this.pricingService.getNativeToUSDPriceQuote(networkName, dto); // Call the service with the network name
  }

  @Get('hst-usd-price')
  @ApiOperation({
    summary: 'Get Histori (HST) to ETH price and convert it to USD',
  })
  @ApiResponse({
    status: 200,
    description: 'The HST price in USD.',
    type: UniswapPriceInfoResponseDto, // or a DTO if you want to define a response structure
  })
  @ApiBadRequestResponse({
    description: 'Invalid network name.',
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
  async getHistoriPriceInUSD(
    @Param('network') networkName: string,
    @Query() dto: BlockHeightOrDateDto,
  ): Promise<UniswapPriceInfoResponseDto> {
    return this.pricingService.getHistoriPriceQuote(networkName, dto); // Call the service to get the HST price in USD
  }
}
