// guards/block-number.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { ethers } from 'ethers';
import { Request } from 'express';
import { EthersHelperService } from 'src/services/ethers-helper.service';

@Injectable()
export class BlockHeightGuard implements CanActivate {
  constructor(private readonly ethersHelperService: EthersHelperService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const blockHeight = request.query.block_height;
    // If block_height is not provided, allow the request to pass
    if (!blockHeight) {
      return true;
    }

    const networkName = request.params.network; // Can be either string or number

    const blockNumber = parseInt(blockHeight as string, 10);

    // Check if the block number is valid
    if (isNaN(blockNumber) || blockNumber < 0) {
      throw new BadRequestException('Block number must be a valid number.');
    }

    // Initialize the provider
    const provider: ethers.JsonRpcProvider =
      await this.ethersHelperService.getProvider(networkName);

    // Fetch the latest block number from the blockchain
    const latestBlockNumber = await provider.getBlockNumber();

    // Check if the block number exceeds the latest block
    if (blockNumber > latestBlockNumber) {
      throw new BadRequestException(
        `The block number ${blockNumber} exceeds the latest block number ${latestBlockNumber}.`,
      );
    }

    return true; // Allow the request to proceed
  }
}
