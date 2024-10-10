import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { GetSingleAllowanceRequestDto } from 'src/dtos/get-single-allowance-request.dto';
import { GetRangeAllowanceRequestDto } from 'src/dtos/get-range-allowance-request.dto';
import { AllowanceDto } from 'src/dtos/allowance.dto';
import { EthersHelperService } from 'src/services/ethers-helper.service';
import { DynamicConnectionService } from 'src/services/dynamic-connection.service';
import { Allowance } from 'src/entities/allowance.entity';

@Injectable()
export class AllowanceService {
  constructor(
    private readonly dynamicConnectionService: DynamicConnectionService,
    private readonly ethersHelperService: EthersHelperService,
  ) {}

  /**
   * Query a single allowance at a specific block number or timestamp
   */
  async getSingleAllowance(
    networkName: string,
    dto: GetSingleAllowanceRequestDto,
  ): Promise<AllowanceDto> {
    const { tokenAddress, timestamp, blockNumber } = dto;

    let { owner, spender } = dto;

    // Resolve ENS name if applicable
    owner = await this.ethersHelperService.resolveWalletAddress(
      networkName,
      owner,
    );

    // Resolve ENS name if applicable
    spender = await this.ethersHelperService.resolveWalletAddress(
      networkName,
      spender,
    );

    const allowanceRepository =
      await this.dynamicConnectionService.getRepository<Allowance>(
        networkName,
        Allowance,
      );

    // Check if the allowance already exists in the DB
    const existingAllowance = await allowanceRepository.findOne({
      where: {
        owner: owner,
        spender: spender,
        contractAddress: tokenAddress,
        blockNumber: blockNumber,
      },
    });

    if (existingAllowance) {
      return existingAllowance;
    }

    // Initialize provider
    const provider: ethers.JsonRpcProvider = new ethers.JsonRpcProvider(
      process.env[`RPC_URL_${networkName.toUpperCase()}`],
    );

    let finalBlockNumber: number;
    if (timestamp) {
      finalBlockNumber = await this.ethersHelperService.convertToBlockNumber(
        timestamp,
        provider,
      );
    } else {
      finalBlockNumber = blockNumber
        ? blockNumber
        : await provider.getBlockNumber();
    }

    // Query the allowance at the specified block
    const allowanceDto =
      await this.ethersHelperService.queryAllowanceWithEthers(
        owner,
        spender,
        tokenAddress,
        finalBlockNumber,
        provider,
      );

    // Save the allowance if it does not exist
    if (!existingAllowance) {
      await allowanceRepository.save(allowanceDto);
    }

    return allowanceDto;
  }

  /**
   * Query allowances over a block range
   */
  async getRangeAllowances(
    networkName: string,
    dto: GetRangeAllowanceRequestDto,
  ): Promise<AllowanceDto[]> {
    const { tokenAddress, period, startBlock, endBlock } = dto;

    let { owner, spender } = dto;
    // Resolve ENS name if applicable
    owner = await this.ethersHelperService.resolveWalletAddress(
      networkName,
      owner,
    );

    // Resolve ENS name if applicable
    spender = await this.ethersHelperService.resolveWalletAddress(
      networkName,
      spender,
    );

    const allowanceRepository =
      await this.dynamicConnectionService.getRepository<Allowance>(
        networkName,
        Allowance,
      );

    // Initialize provider
    const provider: ethers.JsonRpcProvider = new ethers.JsonRpcProvider(
      process.env[`RPC_URL_${networkName.toUpperCase()}`],
    );

    let startBlockNumber: number;
    let endBlockNumber: number;

    if (period) {
      startBlockNumber = await this.ethersHelperService.convertToBlockNumber(
        period.start,
        provider,
      );
      endBlockNumber = await this.ethersHelperService.convertToBlockNumber(
        period.end,
        provider,
      );
    } else {
      startBlockNumber = startBlock!;
      endBlockNumber = endBlock!;
    }

    const allowances: AllowanceDto[] = [];
    let previousAllowance: AllowanceDto | null = null;

    for (let block = startBlockNumber; block <= endBlockNumber; block++) {
      const allowance = await this.ethersHelperService.queryAllowanceWithEthers(
        owner,
        spender,
        tokenAddress,
        block,
        provider,
      );

      // Only save if the allowance is different from the previous one
      if (
        !previousAllowance ||
        previousAllowance.allowance !== allowance.allowance
      ) {
        const existingAllowance = await allowanceRepository.findOne({
          where: {
            owner: allowance.owner,
            spender: allowance.spender,
            contractAddress: allowance.contractAddress,
            blockNumber: allowance.blockNumber,
          },
        });

        if (!existingAllowance) {
          await allowanceRepository.save(allowance);
        }

        previousAllowance = allowance;
      }

      allowances.push(allowance);
    }

    return allowances;
  }
}
