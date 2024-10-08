import { Controller, Get, Param, Query } from '@nestjs/common';
import { TokenService } from './token.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { TokenDto } from 'src/dtos/token.dto';
import { GetTokensRequestDto } from 'src/dtos/get-tokens-request.dto';
import { GetTokenByAddressDto } from 'src/dtos/get-token-by-address.dto';

@ApiTags('Tokens')
@Controller(':version/:networkName/token')
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
    name: 'version',
    description: 'API version, currently only v1 is supported',
    example: 'v1',
  })
  @ApiParam({
    name: 'networkName',
    description: 'Blockchain network, currently only eth-mainnet is supported',
    example: 'eth-mainnet',
  })
  async getTokens(
    @Param('version') version: string,
    @Param('networkName') networkName: string,
    @Query() query: GetTokensRequestDto,
  ) {
    const { tokenType, page = 1, limit = 10 } = query;
    return this.tokenService.getPaginatedTokens(
      networkName,
      tokenType,
      page,
      limit,
    );
  }

  @Get(':contractAddress')
  @ApiOperation({ summary: 'Get token by contract address.' })
  @ApiResponse({
    status: 200,
    description: 'The token details.',
    type: TokenDto,
  })
  @ApiParam({
    name: 'version',
    description: 'API version, currently only v1 is supported',
    example: 'v1',
  })
  @ApiParam({
    name: 'networkName',
    description: 'Blockchain network, currently only eth-mainnet is supported',
    example: 'eth-mainnet',
  })
  async getTokenByAddress(
    @Param('version') version: string,
    @Param('networkName') networkName: string,
    @Param() params: GetTokenByAddressDto,
  ): Promise<TokenDto> {
    const { contractAddress } = params;
    // Proceed with the token service using the resolved address
    return this.tokenService.getTokenByAddress(networkName, contractAddress);
  }
}
