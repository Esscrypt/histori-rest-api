import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AllowanceService } from './allowance.service';
import { EnsService } from 'src/services/ens.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { AllowanceDto } from 'src/dtos/allowance.dto';
import { GetAllowanceRequestDto } from 'src/dtos/get-allowance-request.dto';
import { ApiKeyGuard } from 'src/guards/api-key.guard';

@ApiTags('Allowances')
@Controller(':version/:networkName/allowance')
@UseGuards(ApiKeyGuard)
export class AllowanceController {
  constructor(
    private readonly allowanceService: AllowanceService,
    private readonly ensService: EnsService,
  ) {}

  @Get()
  @ApiOperation({
    summary:
      'Get allowance by owner, spender, token, and block number for a given network.',
  })
  @ApiResponse({
    status: 200,
    description: 'The allowance data.',
    type: AllowanceDto,
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
  async getAllowance(
    @Param('version') version: string,
    @Param('networkName') networkName: string,
    @Query() query: GetAllowanceRequestDto,
  ): Promise<AllowanceDto> {
    let { owner, spender } = query;
    const { tokenAddress, blockNumber } = query;

    try {
      // Set the network for ENS resolution
      this.ensService.setNetwork(networkName);

      // Resolve ENS names for owner and spender
      owner = await this.ensService.resolveEnsName(owner);
      spender = await this.ensService.resolveEnsName(spender);
    } catch (error) {
      throw new Error(`Failed to resolve ENS names: ${error.message}`);
    }

    return this.allowanceService.getAllowance(
      networkName,
      owner,
      spender,
      tokenAddress,
      parseInt(blockNumber),
    );
  }
}
