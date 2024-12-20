import { Controller, Get, Param, Query } from '@nestjs/common';
import { VaultService } from './vault.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiParam,
} from '@nestjs/swagger';
import { VaultInfoResponseDto } from 'src/dtos/response/vault-info-response.dto';
import { GetVaultInfoDto } from 'src/dtos/request/get-vault-info.dto';
import { SupportedNetworksService } from 'src/services/supported-networks.service';
import { EthersHelperService } from 'src/services/ethers-helper.service';

@ApiTags('Vault')
@Controller(':network/vaults')
export class VaultController {
  constructor(
    private readonly vaultService: VaultService,
    private readonly supportedNetworksService: SupportedNetworksService,
    private readonly ethersHelperService: EthersHelperService,
  ) {}

  @Get('single')
  @ApiOperation({ summary: 'Get ERC-4626 token vault information by address.' })
  @ApiParam({
    name: 'network',
    description: 'Blockchain network name or chain id',
    example: 'eth-mainnet',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Vault information retrieved successfully.',
    type: VaultInfoResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid request or vault address.' })
  async getVaultInfo(
    @Param('network') networkName: string,
    @Query() dto: GetVaultInfoDto,
  ): Promise<VaultInfoResponseDto> {
    const { vault_address } = dto;
    const chainId = this.supportedNetworksService.getChainId(networkName);
    const provider = await this.ethersHelperService.getProvider(networkName);

    return this.vaultService.getVaultInfo({
      networkName,
      chain_id: chainId,
      vault_address,
      provider,
    });
  }
}
