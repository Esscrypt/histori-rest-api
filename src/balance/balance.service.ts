import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { GetSingleBalanceRequestDto } from 'src/dtos/get-single-balance-request.dto';
import { GetRangeBalanceRequestDto } from 'src/dtos/get-range-balance-request.dto';

import { BalanceDto } from 'src/dtos/balance.dto';
import { EthersHelperService } from 'src/services/ethers-helper.service';
import { DynamicConnectionService } from 'src/services/dynamic-connection.service';
import { Balance } from 'src/entities/balance.entity';

@Injectable()
export class BalanceService {
  constructor(
    private readonly dynamicConnectionService: DynamicConnectionService,
    private readonly ethersHelperService: EthersHelperService,
  ) {}

  /**
   * Query a single balance at a specific block number or timestamp
   */
  async getSingleBalance(
    networkName: string,
    dto: GetSingleBalanceRequestDto,
  ): Promise<BalanceDto> {
    const { tokenAddress, timestamp, blockNumber } = dto;
    let { holder } = dto;

    // Resolve ENS name if applicable
    holder = await this.ethersHelperService.resolveWalletAddress(
      networkName,
      holder,
    );

    const balanceRepository =
      await this.dynamicConnectionService.getRepository<Balance>(
        networkName,
        Balance,
      );

    // Check if the allowance already exists in the DB
    const existingBalance = await balanceRepository.findOne({
      where: {
        holder: holder,
        contractAddress: tokenAddress,
        blockNumber: blockNumber,
      },
    });

    if (existingBalance) {
      return existingBalance;
    }

    // Initialize the provider
    const provider: ethers.JsonRpcProvider = new ethers.JsonRpcProvider(
      process.env[`RPC_URL_${networkName.toUpperCase()}`],
    );

    let finalBlockNumber: number;
    // If timestamp is provided, convert it to block number
    if (timestamp) {
      finalBlockNumber = await this.ethersHelperService.convertToBlockNumber(
        timestamp,
        provider,
      );
    } else {
      // If no block number is provided, use the latest block
      finalBlockNumber = blockNumber || (await provider.getBlockNumber());
    }

    // Query the balance at the given block number
    const balanceDto = await this.ethersHelperService.queryBalanceWithEthers(
      holder,
      tokenAddress,
      finalBlockNumber,
      provider,
    );

    // Store balance if unique and in batch
    await this.storeBalancesInBatch([balanceDto], balanceRepository);

    return balanceDto;
  }

  /**
   * Query balances over a block range (maximum 1 day)
   */
  async getRangeBalances(
    networkName: string,
    dto: GetRangeBalanceRequestDto,
  ): Promise<BalanceDto[]> {
    const { tokenAddress, period, startBlock, endBlock } = dto;
    let { holder } = dto;

    // Resolve ENS name if applicable
    holder = await this.ethersHelperService.resolveWalletAddress(
      networkName,
      holder,
    );

    const balanceRepository =
      await this.dynamicConnectionService.getRepository<Balance>(
        networkName,
        Balance,
      );

    // Initialize the provider
    const provider: ethers.JsonRpcProvider = new ethers.JsonRpcProvider(
      process.env[`RPC_URL_${networkName.toUpperCase()}`],
    );

    let startBlockNumber: number;
    let endBlockNumber: number;

    // Handle the period or block range
    if (period) {
      startBlockNumber = await this.ethersHelperService.convertToBlockNumber(
        period.start,
        provider,
      );
      endBlockNumber = period.end
        ? await this.ethersHelperService.convertToBlockNumber(
            period.end,
            provider,
          )
        : startBlockNumber;
    } else {
      startBlockNumber = startBlock;
      endBlockNumber = endBlock || startBlock;
    }

    // Ensure the range does not exceed 1 day
    const startBlockData = await provider.getBlock(startBlockNumber);
    const endBlockData = await provider.getBlock(endBlockNumber);
    const thirtyDaysInSeconds = 30 * 24 * 60 * 60;

    if (
      endBlockData.timestamp - startBlockData.timestamp >
      thirtyDaysInSeconds
    ) {
      throw new Error('The block range exceeds the maximum limit of 30 days.');
    }

    // Query balances over the block range
    const balanceSet = new Set<BalanceDto>();
    for (let block = startBlockNumber; block <= endBlockNumber; block++) {
      const balance = await this.ethersHelperService.queryBalanceWithEthers(
        holder,
        tokenAddress,
        block,
        provider,
      );

      // Add unique balance entries to the set
      balanceSet.add(balance);
    }

    // Store all balances as a batch
    await this.storeBalancesInBatch([...balanceSet], balanceRepository);

    return [...balanceSet];
  }

  /**
   * Store balances in batch to the DB.
   */
  private async storeBalancesInBatch(
    balances: BalanceDto[],
    balanceRepository: any,
  ) {
    const uniqueBalances = [];

    // Query the DB for the last saved balance and filter unique balances
    for (const balance of balances) {
      const existingBalance = await balanceRepository.findOne({
        where: {
          holder: balance.holder,
          contractAddress: balance.contractAddress,
          blockNumber: balance.blockNumber,
        },
      });

      if (!existingBalance || existingBalance.balance !== balance.balance) {
        uniqueBalances.push(balance);
      }
    }

    // Save all unique balances to the DB in batch
    if (uniqueBalances.length > 0) {
      await balanceRepository.save(uniqueBalances);
    }
  }
}
