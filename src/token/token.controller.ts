import { Controller, Get, Param, Query } from '@nestjs/common';
import { TokenService } from './token.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { TokenDto } from 'src/dtos/token.dto';
import { GetTokensRequestDto } from 'src/dtos/get-tokens-request.dto';
import { GetTokenByAddressDto } from 'src/dtos/get-token-by-address.dto';

@ApiTags('Tokens')
@Controller(':network/token')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Get()
  @ApiOperation({
    summary: 'Get a paginated list of tokens, optionally filter by type.',
  })
  @ApiResponse({
    status: 200,
    description: 'The paginated list of tokens.',
    type: [TokenDto],
  })
  @ApiParam({
    name: 'network',
    description:
      'Blockchain network name or chain id, currently only eth-mainnet (or 1) is supported',
    example: 'eth-mainnet',
  })
  async getTokens(
    @Param('network') networkName: string,
    @Query() query: GetTokensRequestDto,
  ) {
    return this.tokenService.getTokens(networkName, query);
  }

  @Get(':contractAddress')
  @ApiOperation({ summary: 'Get token by contract address.' })
  @ApiResponse({
    status: 200,
    description: 'The token details.',
    type: TokenDto,
  })
  @ApiParam({
    name: 'network',
    description:
      'Blockchain network name or chain id, currently only eth-mainnet (or 1) is supported',
    example: 'eth-mainnet',
  })
  async getTokenByAddress(
    @Param('network') networkName: string,
    @Param() params: GetTokenByAddressDto,
  ): Promise<TokenDto> {
    return this.tokenService.getTokenByAddress(networkName, params);
  }
}
