import { Injectable, BadRequestException } from '@nestjs/common';
import { ethers } from 'ethers';
import { GetBlockRequestDto } from 'src/dtos/get-block-request.dto';
import {
  GetGasPriceRequestDto,
  GetGasPriceRequestDtoTransactionType,
} from 'src/dtos/get-gas-price.dto';
import { GetLogsRequestDto } from 'src/dtos/get-logs-request.dto';

@Injectable()
export class CommonService {
  /**
   * Get the current block height
   */
  async getBlockHeight(networkName: string): Promise<number> {
    try {
      const provider: ethers.JsonRpcProvider = new ethers.JsonRpcProvider(
        process.env[`RPC_URL_${networkName.toUpperCase()}`],
      );
      return await provider.getBlockNumber();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new BadRequestException('Failed to fetch block height');
    }
  }

  async getGasPrice(
    networkName: string,
    dto: GetGasPriceRequestDto,
  ): Promise<any> {
    const { type } = dto;
    let estimatedGasUnits: bigint;
    const currentTime = new Date().toISOString(); // To track updated_at field

    // Define gas units based on the type of transaction
    switch (type) {
      case GetGasPriceRequestDtoTransactionType.NATIVE_TRANSFER:
        estimatedGasUnits = BigInt(21000); // Standard gas for ETH transfers
        break;
      case GetGasPriceRequestDtoTransactionType.ERC20_TRANSFER:
        estimatedGasUnits = BigInt(50000); // Approximate gas for ERC20 transfers
        break;
      case GetGasPriceRequestDtoTransactionType.SWAP:
        estimatedGasUnits = BigInt(356190); // Gas estimate for swaps
        break;
      default:
        throw new BadRequestException('Invalid transaction type');
    }

    try {
      // Initialize the provider with the correct network
      const provider: ethers.JsonRpcProvider = new ethers.JsonRpcProvider(
        process.env[`RPC_URL_${networkName.toUpperCase()}`],
      );

      // Get the current gas price and base fee from the provider
      const feeData = await provider.getFeeData();
      const gasPrice = feeData.gasPrice;

      // Calculate the total gas cost (units * gas price)
      const totalGasCost = gasPrice * estimatedGasUnits;

      // Format the gas cost to Gwei for user readability
      const formattedGasCost = ethers.formatUnits(totalGasCost, 'gwei');
      const baseFeeFormatted = ethers.formatUnits(gasPrice || 0, 'gwei');

      // Create response in the specified format
      const response = {
        chain_id: 1, // Example: replace with actual chain ID
        chain_name: networkName, // Network name (like eth-mainnet)
        quote_currency: 'USD', // Example: Currency can be dynamically fetched or configured
        updated_at: currentTime,
        event_type: type,
        gas_quote_rate: parseFloat(ethers.formatUnits(gasPrice, 'gwei')),
        base_fee: baseFeeFormatted,
        items: [
          {
            gas_price: formattedGasCost,
            gas_spent: estimatedGasUnits.toString(),
            gas_quote: parseFloat(ethers.formatUnits(totalGasCost, 'gwei')),
            other_fees: {
              l1_gas_quote: 0, // Assuming no L1 gas here. Set to a value if applicable.
            },
            total_gas_quote: parseFloat(
              ethers.formatUnits(totalGasCost, 'gwei'),
            ),
            pretty_total_gas_quote: `$${(parseFloat(ethers.formatUnits(totalGasCost, 'gwei')) * 0.0001).toFixed(2)} USD`, // Example conversion
            interval: `${estimatedGasUnits} units at ${formattedGasCost} Gwei`,
          },
        ],
      };

      return response;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new BadRequestException('Failed to fetch gas price');
    }
  }

  /**
   * Get logs for a specific contract address
   */
  async getLogs(
    networkName: string,
    query: GetLogsRequestDto,
  ): Promise<ethers.Log[]> {
    try {
      const { startBlock, endBlock, contractAddress, topics } = query;
      const provider: ethers.JsonRpcProvider = new ethers.JsonRpcProvider(
        process.env[`RPC_URL_${networkName.toUpperCase()}`],
      );

      const filter = {
        startBlock,
        endBlock,
        address: contractAddress,
        topics,
      };

      return await provider.getLogs(filter);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new BadRequestException('Failed to fetch logs');
    }
  }

  async getLogsByContract(
    networkName: string,
    contractAddress: string,
    query: GetLogsRequestDto,
  ) {
    const { startBlock, endBlock, blockHash } = query;

    if (!ethers.isAddress(contractAddress)) {
      throw new BadRequestException('Invalid contract address.');
    }

    const provider = new ethers.JsonRpcProvider(
      process.env[`RPC_URL_${networkName.toUpperCase()}`],
    );

    const filter = {
      address: contractAddress,
      fromBlock: startBlock || 0,
      toBlock: endBlock || 'latest',
      blockHash,
    };

    const logs = await provider.getLogs(filter);
    return logs;
  }

  async getLogsByTopic(
    networkName: string,
    topicHash: string,
    query: GetLogsRequestDto,
  ) {
    const { startBlock, endBlock, blockHash } = query;

    const provider = new ethers.JsonRpcProvider(
      process.env[`RPC_URL_${networkName.toUpperCase()}`],
    );

    const filter = {
      topics: [topicHash],
      fromBlock: startBlock || 0,
      toBlock: endBlock || 'latest',
      blockHash,
    };

    const logs = await provider.getLogs(filter);
    return logs;
  }

  /**
   * Get a block by block number
   */
  async getBlock(networkName: string, dto: GetBlockRequestDto): Promise<any> {
    const { blockNumber, blockHash } = dto;
    try {
      const provider: ethers.JsonRpcProvider = new ethers.JsonRpcProvider(
        process.env[`RPC_URL_${networkName.toUpperCase()}`],
      );

      let blockData;
      if (dto.blockHash) {
        // Fetch block by block hash
        blockData = await provider.getBlock(blockHash);
      } else if (blockNumber) {
        // Fetch block by block number
        blockData = await provider.getBlock(Number(dto.blockNumber));
      }

      if (!blockData) {
        throw new Error('Block not found');
      }

      // Format the block data into the desired structure
      const response = {
        updated_at: new Date().toISOString(), // Current timestamp
        chain_id: provider._network.chainId,
        chain_name: networkName,
        items: [
          {
            block_hash: blockData.hash,
            signed_at: new Date(blockData.timestamp * 1000),
            height: blockData.number,
            block_parent_hash: blockData.parentHash,
            extra_data: blockData.extraData,
            miner_address: blockData.miner,
            gas_used: blockData.gasUsed.toString(),
            gas_limit: blockData.gasLimit.toString(),
            transactions_link: `https://api.etherscan.io/v1/eth-mainnet/block_hash/${blockData.hash}/transactions`,
          },
        ],
        pagination: null,
      };

      return response;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new BadRequestException('Failed to fetch block');
    }
  }
}
