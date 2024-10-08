import { Controller, Get, Param, Query } from '@nestjs/common';
import { BalanceService } from './balance.service';
import { EnsService } from 'src/services/ens.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { BalanceDto } from 'src/dtos/balance.dto';
import { GetBalanceRequestDto } from 'src/dtos/get-balance-request.dto';

@ApiTags('Balances')
@Controller(':version/:networkName/balance')
export class BalanceController {
  constructor(
    private readonly balanceService: BalanceService,
    private readonly ensService: EnsService, // Inject the ENS service
  ) {}

  @Get()
  @ApiOperation({
    summary:
      'Get balance by wallet, token, and block number for a given network.',
  })
  @ApiResponse({
    status: 200,
    description: 'The balance data.',
    type: BalanceDto,
  })
  @ApiParam({
    name: 'version',
    description: 'API version, currently only v1 is supported',
  })
  @ApiParam({
    name: 'networkName',
    description: 'Blockchain network, currently only eth-mainnet is supported',
  })
  async getBalance(
    @Param('version') version: string,
    @Param('networkName') networkName: string,
    @Query() query: GetBalanceRequestDto,
  ): Promise<BalanceDto> {
    let { walletAddress } = query;
    const { tokenAddress, blockNumber } = query;
    try {
      // Set the network for ENS resolution
      this.ensService.setNetwork(networkName);

      // Resolve ENS name for walletAddress
      walletAddress = await this.ensService.resolveEnsName(walletAddress);
    } catch (error) {
      throw new Error(`Failed to resolve ENS name: ${error.message}`);
    }

    return this.balanceService.getBalance(
      networkName,
      walletAddress,
      tokenAddress,
      parseInt(blockNumber),
    );
  }
}
