import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { TokenSupplyService } from './token-supply.service';
import { TokenSupplyDto } from 'src/dtos/token-supply.dto';
import { GetTokenSupplyRequestDto } from 'src/dtos/get-token-supply-request.dto'; // Assuming you have or will create this DTO

@ApiTags('TokenSupplies')
@Controller(':network/token-supply')
export class TokenSupplyController {
  constructor(private readonly tokenSupplyService: TokenSupplyService) {}

  @Get()
  @ApiOperation({
    summary:
      'Get token supply by token address and block number for a given network.',
  })
  @ApiResponse({
    status: 200,
    description: 'The token supply data.',
    type: TokenSupplyDto,
  })
  @ApiParam({
    name: 'network',
    description:
      'Blockchain network name or chain id, currently only eth-mainnet (or 1) is supported',
    example: 'eth-mainnet',
  })
  async getTokenSupply(
    @Param('network') networkName: string,
    @Query() query: GetTokenSupplyRequestDto,
  ): Promise<TokenSupplyDto> {
    const { tokenAddress, blockNumber } = query;

    return this.tokenSupplyService.getTokenSupply(
      networkName,
      tokenAddress,
      parseInt(blockNumber),
    );
  }
}
