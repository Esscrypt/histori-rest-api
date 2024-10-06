import { Controller, Get, Param } from '@nestjs/common';
import { TokenIDService } from './token-id.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { TokenIDDto } from 'src/dtos/token-id.dto';

@ApiTags('TokenIDs')
@Controller(':version/:network_name/token-id')
export class TokenIDController {
  constructor(private readonly tokenIDService: TokenIDService) {}

  @Get(':contract_address/:token_id')
  @ApiOperation({
    summary:
      'Get token metadata by contract address and token ID for a given network.',
  })
  @ApiResponse({
    status: 200,
    description: 'The token metadata.',
    type: TokenIDDto,
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
    name: 'contract_address',
    description: 'The contract address of the token in hexadecimal format',
    example: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
  })
  @ApiParam({
    name: 'token_id',
    description: 'The token ID for the ERC721 or ERC1155 token',
    example: 1,
  })
  async getTokenID(
    @Param('network_name') network_name: string,
    @Param('contract_address') contract_address: string,
    @Param('token_id') token_id: string,
  ): Promise<TokenIDDto> {
    return this.tokenIDService.getTokenID(
      network_name,
      contract_address,
      token_id,
    );
  }
}
