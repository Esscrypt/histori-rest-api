import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { TokenSupplyService } from './token-supply.service';
// import { TokenSupplyDto } from 'src/dtos/token-supply.dto';
import { GetTokenSupplyRequestDto } from 'src/dtos/request/get-token-supply-request.dto'; // Assuming you have or will create this DTO
import { TokenSupplyResponseDto } from 'src/dtos/response/token-supply-response.dto';

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
    type: TokenSupplyResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request parameters.',
  })
  @ApiResponse({
    status: 404,
    description: 'Token supply not found',
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
  async getTokenSupply(
    @Param('network') networkName: string,
    @Query() query: GetTokenSupplyRequestDto,
  ): Promise<TokenSupplyResponseDto> {
    return this.tokenSupplyService.getTokenSupply(networkName, query);
  }
}
