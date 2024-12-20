import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ethers, Contract } from 'ethers';
import { VaultInfoResponseDto } from 'src/dtos/response/vault-info-response.dto';
import { TokenDto } from 'src/dtos/token.dto';
import { EthersHelperService } from 'src/services/ethers-helper.service';

@Injectable()
export class VaultService {
  private readonly logger = new Logger(VaultService.name);
  constructor(private readonly ethersHelperService: EthersHelperService) {}
  private readonly abi: string[] = [
    'function name() view returns (string)',
    'function symbol() view returns (string)',
    'function totalAssets() view returns (uint256)',
    'function totalSupply() view returns (uint256)',
    'function asset() view returns (address)',
  ];

  /**
   * Safely call a contract method and handle errors gracefully.
   * @param contract - The ethers Contract instance
   * @param method - The method name to call
   * @param args - The arguments for the method
   * @returns The result of the contract method or null if it fails
   */
  private async safeCall<T>(
    contract: Contract,
    method: string,
    ...args: any[]
  ): Promise<T | null> {
    try {
      return await contract[method](...args);
    } catch (error) {
      console.error(`Error calling ${method}:`, error);
      return null;
    }
  }

  /**
   * Get vault information
   * @param options - The options object containing networkName, chainId, and vaultAddress
   * @returns VaultInfoResponseDto
   */
  async getVaultInfo(options: {
    networkName: string;
    chain_id: number;
    vault_address: string;
    provider: ethers.JsonRpcProvider;
  }): Promise<VaultInfoResponseDto> {
    const { networkName, chain_id, vault_address, provider } = options;

    const vaultContract: Contract = new ethers.Contract(
      vault_address,
      this.abi,
      provider,
    );

    try {
      const [name, symbol, totalAssets, totalShares, underlyingAsset] =
        await Promise.all([
          this.safeCall<string>(vaultContract, 'name'),
          this.safeCall<string>(vaultContract, 'symbol'),
          this.safeCall<bigint>(vaultContract, 'totalAssets'),
          this.safeCall<bigint>(vaultContract, 'totalSupply'),
          this.safeCall<string>(vaultContract, 'asset'),
        ]);

      if (
        !name ||
        !symbol ||
        !totalAssets ||
        !totalShares ||
        !underlyingAsset
      ) {
        throw new NotFoundException('Failed to fetch vault information.');
      }

      const exchangeRate = (Number(totalAssets) / Number(totalShares)).toFixed(
        6,
      );

      const underlyingToken: TokenDto =
        await this.ethersHelperService.queryTokenData(
          underlyingAsset,
          provider,
        );
      this.logger.log(`Underlying token: ${JSON.stringify(underlyingToken)}`);

      return {
        network_name: networkName,
        chain_id,
        vault_address,
        name,
        symbol,
        total_assets: totalAssets.toString(),
        total_assets_eth: ethers.formatEther(totalAssets),
        total_shares: totalShares.toString(),
        total_shares_eth: ethers.formatEther(totalShares),
        exchange_rate: exchangeRate,
        underlying_asset: underlyingToken, // TODO: get underlying asset type and info
      };
    } catch (error) {
      console.error('Error fetching vault info:', error);
      throw new NotFoundException('Vault not found or invalid contract.');
    }
  }
}
