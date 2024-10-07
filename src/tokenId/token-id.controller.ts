import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { TokenIDService } from './token-id.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { TokenIDDto } from 'src/dtos/token-id.dto';
import { GetTokenIDRequestDto } from 'src/dtos/get-token-id-request.dto'; // Create this DTO for query validation
import { ApiKeyGuard } from 'src/guards/api-key.guard';
import { EnsService } from 'src/services/ens.service'; // Import ENS service for ENS resolution

@ApiTags('TokenIDs')
@Controller(':version/:networkName/token-id')
@UseGuards(ApiKeyGuard)
export class TokenIDController {
  constructor(
    private readonly tokenIDService: TokenIDService,
    private readonly ensService: EnsService, // Inject ENS service for ENS resolution
  ) {}

  @Get()
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
    name: 'networkName',
    description: 'Blockchain network, currently only eth-mainnet is supported',
  })
  async getTokenID(
    @Param('version') version: string,
    @Param('networkName') networkName: string,
    @Query() query: GetTokenIDRequestDto,
  ): Promise<TokenIDDto> {
    const { contractAddress, tokenId } = query;

    return this.tokenIDService.getTokenID(
      networkName,
      contractAddress,
      tokenId,
    );
  }
}
