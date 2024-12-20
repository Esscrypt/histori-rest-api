import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ethers } from 'ethers';
import { CheckComplianceResponseDto } from 'src/dtos/response/check-compliance-response.dto';
import { EthersHelperService } from 'src/services/ethers-helper.service';
import { SupportedNetworksService } from 'src/services/supported-networks.service';

@Injectable()
export class ComplianceService {
  private readonly logger = new Logger(ComplianceService.name);
  constructor(
    private readonly supportedNetworksService: SupportedNetworksService,
    private readonly ethersHelperService: EthersHelperService,
  ) {}

  async isBlacklisted({
    network,
    holder,
    token_address,
    type,
    date,
    block_height,
  }: {
    network: string;
    holder: string;
    token_address: string;
    type: string;
    date: string;
    block_height: number;
  }): Promise<CheckComplianceResponseDto> {
    try {
      holder = await this.ethersHelperService.resolveWalletAddress(
        network,
        holder,
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error: any) {}

    let address = token_address; // might be undefined
    let abi = ['function isBlacklisted(address _account) view returns (bool)'];
    let abi_method = 'isBlacklisted';
    if (type) {
      if (type == 'USDC') {
        address = this.supportedNetworksService.getUSDCTokenAddress(network);
        if (!address) {
          throw new NotFoundException('USDC not supported on this network');
        }
      } else if (type == 'USDT') {
        address = this.supportedNetworksService.getUSDTTokenAddress(network);
        abi = ['function isBlackListed(address _account) view returns (bool)'];
        abi_method = 'isBlackListed';
        if (!address) {
          throw new NotFoundException('USDT not supported on this network');
        }
      }
    }

    if (!address) {
      throw new NotFoundException('Token address not found');
    }

    if (process.env.NODE_ENV === 'development') {
      this.logger.log(`Checking blacklist status for ${holder}`);
      this.logger.log(`Token address: ${address}`);
      this.logger.log(`abi: ${abi}`);
    }

    const provider = await this.ethersHelperService.getProvider(network);
    const contract = new ethers.Contract(address, abi, provider);

    const chain_id = this.supportedNetworksService.getChainId(network);

    const finalBlockNumber = await this.ethersHelperService.getFinalBlockNumber(
      date,
      block_height,
      provider,
    );

    try {
      const blacklisted = await contract[abi_method](holder, {
        blockTag: finalBlockNumber,
      });
      return {
        network,
        chain_id,
        holder,
        token_address: address,
        status: blacklisted,
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      this.logger.error(error);
      throw new NotFoundException('Token does not support blacklist check');
    }
  }
}
