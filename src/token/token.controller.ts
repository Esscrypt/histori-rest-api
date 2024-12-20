import {
  Controller,
  ForbiddenException,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { TokenService } from './token.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBadRequestResponse,
  ApiQuery,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { GetTokenByAddressDto } from 'src/dtos/request/get-token-by-address.dto';
import { TokenResponseDto } from 'src/dtos/response/token-response.dto';
import { PaginatedTokensResponseDto } from 'src/dtos/response/paginated-token-response.dto';
import { GetTokensRequestDto } from 'src/dtos/request/get-tokens-request.dto';
import { GetTokensByNameRequestDto } from 'src/dtos/request/get-tokens-by-name-request.dto';
import { GetTokensBySymbolRequestDto } from 'src/dtos/request/get-tokens-by-symbol-request.dto';
import { SupportedNetworksService } from 'src/services/supported-networks.service';

@ApiTags('Tokens')
@Controller(':network/tokens')
export class TokenController {
  constructor(
    private readonly tokenService: TokenService,
    private readonly supportedNetworksService: SupportedNetworksService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get a paginated list of tokens, optionally filter by type.',
  })
  @ApiResponse({
    status: 200,
    description: 'The paginated list of tokens.',
    type: PaginatedTokensResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid request parameters.',
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
  async getTokens(
    @Param('network') networkName: string,
    @Query() query: GetTokensRequestDto,
  ): Promise<PaginatedTokensResponseDto> {
    const endpoint = 'tokens'; // Adjust based on the actual endpoint logic
    if (
      !this.supportedNetworksService.isEndpointSupported(endpoint, networkName)
    ) {
      throw new ForbiddenException(
        `Endpoint not allowed for network: ${networkName}`,
      );
    }

    return this.tokenService.getTokens(networkName, query);
  }

  @Get('single')
  @ApiOperation({ summary: 'Get token by contract address.' })
  @ApiResponse({
    status: 200,
    description: 'The token details.',
    type: TokenResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid request parameters.',
  })
  @ApiResponse({
    status: 404,
    description: 'Token not found.',
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
  async getTokenByAddress(
    @Param('network') networkName: string,
    @Query() params: GetTokenByAddressDto,
  ): Promise<TokenResponseDto> {
    return this.tokenService.getTokenByAddress(networkName, params);
  }

  @Get('by-symbol')
  @ApiOperation({ summary: 'Get paginated tokens filtered by symbol.' })
  @ApiResponse({
    status: 200,
    description: 'Paginated tokens filtered by symbol.',
    type: PaginatedTokensResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid request parameters.',
  })
  @ApiNotFoundResponse({
    description: 'No tokens found with the given symbol.',
  })
  @ApiParam({
    name: 'network',
    description: 'Blockchain network name or chain id',
    example: 'eth-mainnet',
    required: true,
  })
  async getTokensBySymbol(
    @Param('network') networkName: string,
    @Query() dto: GetTokensBySymbolRequestDto,
  ): Promise<PaginatedTokensResponseDto> {
    const endpoint = 'tokens/by-symbol'; // Adjust based on the actual endpoint logic
    if (
      !this.supportedNetworksService.isEndpointSupported(endpoint, networkName)
    ) {
      throw new ForbiddenException(
        `Endpoint ${endpoint} not allowed for network: ${networkName}`,
      );
    }
    return this.tokenService.getTokensBySymbol(networkName, dto);
  }

  @Get('by-name')
  @ApiOperation({ summary: 'Get paginated tokens filtered by name.' })
  @ApiResponse({
    status: 200,
    description: 'Paginated tokens filtered by name.',
    type: PaginatedTokensResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid request parameters.',
  })
  @ApiNotFoundResponse({
    description: 'No tokens found with the given name.',
  })
  @ApiParam({
    name: 'network',
    description: 'Blockchain network name or chain id',
    example: 'eth-mainnet',
    required: true,
  })
  async getTokensByName(
    @Param('network') networkName: string,
    @Query() dto: GetTokensByNameRequestDto,
  ): Promise<PaginatedTokensResponseDto> {
    const endpoint = 'tokens/by-name'; // Adjust based on the actual endpoint logic
    if (
      !this.supportedNetworksService.isEndpointSupported(endpoint, networkName)
    ) {
      throw new ForbiddenException(
        `Endpoint ${endpoint} not allowed for network: ${networkName}`,
      );
    }
    return this.tokenService.getTokensByName(networkName, dto);
  }
}
