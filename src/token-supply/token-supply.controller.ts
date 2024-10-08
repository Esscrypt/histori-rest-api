import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { TokenSupplyService } from './token-supply.service';
import { TokenSupplyDto } from 'src/dtos/token-supply.dto';
import { GetTokenSupplyRequestDto } from 'src/dtos/get-token-supply-request.dto'; // Assuming you have or will create this DTO

@ApiTags('TokenSupplies')
@Controller(':version/:networkName/token-supply')
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
    name: 'version',
    description: 'API version, currently only v1 is supported',
  })
  @ApiParam({
    name: 'networkName',
    description: 'Blockchain network, currently only eth-mainnet is supported',
  })
  async getTokenSupply(
    @Param('version') version: string,
    @Param('networkName') networkName: string,
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
