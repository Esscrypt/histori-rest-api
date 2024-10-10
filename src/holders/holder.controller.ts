import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { GetHoldersRequestDto } from 'src/dtos/get-holders-request.dto';
import { HoldersService } from './holders.service';
import { Holder } from 'src/entities/holder.entity';

@ApiTags('Holders')
@Controller(':version/:networkName/holders')
export class HoldersController {
  constructor(private readonly holdersService: HoldersService) {}

  @Get()
  @ApiOperation({
    summary:
      'Get holders and their respective balances as of a block number or timestamp',
  })
  @ApiResponse({
    status: 200,
    description: 'The holder addresses and their balances.',
    type: [Holder],
  })
  @ApiBadRequestResponse({
    description: 'Invalid request, or scraper server failed.',
  })
  @ApiParam({
    name: 'version',
    description: 'API version, currently only v1 is supported',
  })
  @ApiParam({
    name: 'networkName',
    description: 'Blockchain network, currently only eth-mainnet is supported',
  })
  async getHolders(
    @Param('version') version: string,
    @Param('networkName') networkName: string,
    @Query() query: GetHoldersRequestDto,
  ): Promise<Holder[]> {
    return this.holdersService.getHolders(networkName, query);
  }
}
