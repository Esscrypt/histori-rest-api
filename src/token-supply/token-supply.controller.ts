import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { TokenSupplyService } from './token-supply.service';
import { TokenSupplyDto } from 'src/dtos/token-supply.dto';

@ApiTags('TokenSupplies')
@Controller(':version/:network_name/token-supply')
export class TokenSupplyController {
  constructor(private readonly tokenSupplyService: TokenSupplyService) {}

  @Get(':token_address/:block_number')
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
    name: 'network_name',
    description: 'Blockchain network, currently only eth-mainnet is supported',
  })
  @ApiParam({
    name: 'token_address',
    description: 'The contract address of the token in hexadecimal format',
    example: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
  })
  @ApiParam({
    name: 'block_number',
    description: 'The block number for which the token supply is requested',
    example: 123456,
  })
  async getTokenSupply(
    @Param('network_name') network_name: string,
    @Param('token_address') token_address: string,
    @Param('block_number') block_number: number,
  ): Promise<TokenSupplyDto> {
    return this.tokenSupplyService.getTokenSupply(
      network_name,
      token_address,
      block_number,
    );
  }
}
