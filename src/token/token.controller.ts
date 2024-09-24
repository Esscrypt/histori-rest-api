import { Controller, Get, Param, Query } from '@nestjs/common';
import { TokenService } from './token.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { TokenDto } from 'src/dtos/token.dto';

@ApiTags('Tokens')
@Controller(':version/:network_name/token')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Get()
  @ApiOperation({
    summary: 'Get paginated list of tokens, optionally filter by type.',
  })
  @ApiResponse({
    status: 200,
    description: 'The paginated list of tokens.',
    type: [TokenDto],
  })
  @ApiParam({
    name: 'version',
    description: 'API version, currently only v1 is supported',
  })
  @ApiParam({
    name: 'network_name',
    description: 'Blockchain network, currently only eth-mainnet is supported',
  })
  @ApiQuery({
    name: 'token_type',
    required: false,
    description: 'Filter by token type (e.g., ERC20, ERC721)',
  })
  @ApiQuery({
    name: 'page',
    required: true,
    description: 'The page number for pagination.',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: true,
    description: 'The number of tokens to return per page.',
    example: 10,
  })
  async getTokens(
    @Param('network_name') networkName: string,
    @Query('token_type') tokenType?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.tokenService.getPaginatedTokens(
      networkName,
      tokenType,
      page,
      limit,
    );
  }

  @Get(':contract_address')
  @ApiOperation({ summary: 'Get token by contract address.' })
  @ApiResponse({
    status: 200,
    description: 'The token details.',
    type: TokenDto,
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
  async getTokenByAddress(
    @Param('network_name') networkName: string,
    @Param('contract_address') contractAddress: string,
  ): Promise<TokenDto> {
    return this.tokenService.getTokenByAddress(networkName, contractAddress);
  }
}
