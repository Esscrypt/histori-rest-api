import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { EnsService } from './ens.service';
import { AllowanceDto } from 'src/dtos/allowance.dto';

@Injectable()
export class EthersHelperService {
  constructor(private readonly ensService: EnsService) {}

  // Helper method to resolve ENS name to wallet address
  public async resolveWalletAddress(
    networkName: string,
    walletAddress: string,
  ): Promise<string> {
    try {
      this.ensService.setNetwork(networkName);
      return await this.ensService.resolveEnsName(walletAddress);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error: any) {
      // If ENS resolution fails, return the original wallet address
      return walletAddress;
    }
  }

  // Convert a timestamp or block number to a block number
  public async convertToBlockNumber(
    periodValue: string | Date,
    provider: ethers.JsonRpcProvider,
  ): Promise<number> {
    // If periodValue is already a block number
    if (/^\d+$/.test(periodValue as string)) {
      return parseInt(periodValue as string, 10);
    }

    // If periodValue is a timestamp, convert it to block number
    if (periodValue instanceof Date) {
      const latestBlock = await provider.getBlock('latest');
      const timestamp = Math.floor((periodValue as Date).getTime() / 1000);
      return await this.findBlockByTimestamp(
        timestamp,
        latestBlock.number,
        provider,
      );
    }

    throw new Error(
      'Invalid period value. Must be a block number or timestamp.',
    );
  }

  // Use binary search to find the block closest to the given timestamp
  public async findBlockByTimestamp(
    targetTimestamp: number,
    latestBlockNumber: number,
    provider: ethers.JsonRpcProvider,
  ): Promise<number> {
    let lowerBlock = 0;
    let upperBlock = latestBlockNumber;

    while (lowerBlock <= upperBlock) {
      const midBlock = Math.floor((lowerBlock + upperBlock) / 2);
      const midBlockData = await provider.getBlock(midBlock);

      if (midBlockData.timestamp < targetTimestamp) {
        lowerBlock = midBlock + 1;
      } else if (midBlockData.timestamp > targetTimestamp) {
        upperBlock = midBlock - 1;
      } else {
        return midBlock;
      }
    }

    return lowerBlock; // Return closest block number if exact match not found
  }

  // Function to query balance using ethers.js for a specific block
  public async queryBalanceWithEthers(
    walletAddress: string,
    tokenAddress: string,
    blockNumber: number,
    provider: ethers.JsonRpcProvider,
  ): Promise<any> {
    try {
      const contract = new ethers.Contract(
        tokenAddress,
        [
          'function balanceOf(address) view returns (uint256)',
          'function decimals() view returns (uint8)',
        ],
        provider,
      );

      // Query balance for the holder at the given block number
      const balanceRaw = await contract.balanceOf(walletAddress, {
        blockTag: blockNumber,
      });
      const decimals = await contract.decimals();

      // Format the balance with the decimals
      const balance = ethers.formatUnits(balanceRaw, decimals);

      // Return the BalanceDto
      return {
        holder: walletAddress,
        contractAddress: tokenAddress,
        balance,
        blockNumber,
      };
    } catch (error) {
      console.error('Error querying balance with ethers:', error);
      throw new Error('Failed to query balance');
    }
  }

  // Method to query allowance with ethers.js
  public async queryAllowanceWithEthers(
    owner: string,
    spender: string,
    tokenAddress: string,
    blockNumber: number,
    provider: ethers.JsonRpcProvider,
  ): Promise<AllowanceDto> {
    const contract = new ethers.Contract(
      tokenAddress,
      [
        'function allowance(address owner, address spender) view returns (uint256)',
      ],
      provider,
    );

    const allowance = await contract.allowance(owner, spender, {
      blockTag: blockNumber,
    });
    return {
      tokenType: 'erc20',
      owner,
      spender,
      contractAddress: tokenAddress,
      allowance: ethers.formatUnits(allowance, await contract.decimals()),
      blockNumber,
    };
  }
}
