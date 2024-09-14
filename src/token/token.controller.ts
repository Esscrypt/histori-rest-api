import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { TokenService } from './token.service';
import { ApiKeyGuard } from '../guards/api-key.guard';
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';

@ApiTags('Tokens')  // Group endpoints under "Tokens" in Swagger UI
@Controller('tokens')
@UseGuards(ApiKeyGuard) // Protect all routes with API key guard
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @ApiOperation({ summary: 'Get all paginated tokens with optional filter by token type' })
  @ApiQuery({ name: 'tokenType', required: false, description: 'Filter by token type (erc20, erc721, etc.)' })
  @ApiQuery({ name: 'page', required: true, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: true, description: 'Limit per page' })
  @Get()
  async getAllTokens(
    @Query('tokenType') tokenType?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    return this.tokenService.getAllTokens(tokenType, page, limit);
  }

  @ApiOperation({ summary: 'Get historical ERC20 token balance by wallet address and block number' })
  @ApiParam({ name: 'wallet', description: 'Wallet address' })
  @ApiParam({ name: 'blockNumber', description: 'Block number' })
  @Get('erc20-balance/:wallet/:blockNumber')
  async getERC20Balance(
    @Param('wallet') wallet: string,
    @Param('blockNumber') blockNumber: number
  ) {
    return this.tokenService.getHistoricalERC20Balance(wallet, blockNumber);
  }

  @ApiOperation({ summary: 'Get historical ERC721 token balance by wallet address and block number' })
  @ApiParam({ name: 'wallet', description: 'Wallet address' })
  @ApiParam({ name: 'blockNumber', description: 'Block number' })
  @Get('erc721-balance/:wallet/:blockNumber')
  async getERC721Balance(
    @Param('wallet') wallet: string,
    @Param('blockNumber') blockNumber: number
  ) {
    return this.tokenService.getHistoricalERC721Balance(wallet, blockNumber);
  }

  @ApiOperation({ summary: 'Get token holder addresses at a specific block number' })
  @ApiParam({ name: 'contractAddress', description: 'Contract address of the token' })
  @ApiParam({ name: 'blockNumber', description: 'Block number' })
  @Get('holders/:contractAddress/:blockNumber')
  async getTokenHolders(
    @Param('contractAddress') contractAddress: string,
    @Param('blockNumber') blockNumber: number
  ) {
    return this.tokenService.getTokenHoldersAtBlock(contractAddress, blockNumber);
  }
}
