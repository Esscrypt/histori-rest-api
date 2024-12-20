// chain.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ethers, Log, Transaction } from 'ethers';
import { SupportedNetworksService } from 'src/services/supported-networks.service';
// import { ContractService } from 'src/contract/contract.service';
import { GetLogsRequestDto } from 'src/dtos/request/get-logs-request.dto';
import { LogDto, LogResponseDto } from 'src/dtos/response/log-response.dto';
import { GetLogsNoContractRequestDto } from 'src/dtos/request/get-logs-no-contract-request.dto copy';
import { BlockHeightResponseDto } from 'src/dtos/response/block-heigh-response.dto';
import { GasPriceResponseDto } from 'src/dtos/response/gas-price-response.dto';
import { PricingService } from 'src/pricing/pricing.service';
import { GetBlockRequestDto } from 'src/dtos/request/get-block-request.dto';
import { EthersHelperService } from 'src/services/ethers-helper.service';
import { Logger } from '@nestjs/common';
import { BlockResponseDto } from 'src/dtos/response/block-response.dto';
import { BlockDto } from 'src/dtos/block.dto';
import { CurrencyService } from 'src/services/currency.service';
import { GetBlockRangeRequestDto } from 'src/dtos/request/get-block-range-request.dto';
import { BlockRangeResponseDto } from 'src/dtos/response/block-range-response.dto';

import bn from 'bignumber.js';
import { GetBlockTransactionsRequestDto } from 'src/dtos/request/get-block-transactions-request.dto';
import { BlockTransactionsResponseDto } from 'src/dtos/response/block-transactions-response.dto';
import { TransactionService } from 'src/transaction/transaction.service';
import { TransactionDetailsDto } from 'src/dtos/transaction-details.dto';

@Injectable()
export class ChainService {
  private readonly logger = new Logger(ChainService.name);
  constructor(
    private readonly supportedNetworksService: SupportedNetworksService,
    // private readonly contractService: ContractService,
    private readonly pricingService: PricingService,
    private readonly ethersHelperService: EthersHelperService,
    private readonly currencyService: CurrencyService,
    private readonly transactionService: TransactionService,
  ) {}

  // Helper method to validate log query parameters
  private async validateLogQueryParameters(
    startBlock: number | undefined,
    endBlock: number | undefined,
    blockHash: string | undefined,
    contractAddress: string | undefined,
  ): Promise<void> {
    if (!blockHash) {
      // Ensure both startBlock and endBlock are provided and are valid numbers
      if (startBlock === undefined || endBlock === undefined) {
        throw new BadRequestException(
          'startBlock and endBlock must be provided if blockHash is not specified.',
        );
      }

      // Ensure block numbers are valid
      if (typeof startBlock !== 'number' || typeof endBlock !== 'number') {
        throw new BadRequestException(
          'startBlock and endBlock must be valid block numbers.',
        );
      }

      // Calculate the block range
      const blockRange = endBlock - startBlock;

      // Validate block range is less than 2,000
      if (blockRange > 2000) {
        throw new BadRequestException(
          'Block range must be less than or equal to 2,000 blocks.',
        );
      }

      // Ensure startBlock is less than or equal to endBlock
      if (startBlock > endBlock) {
        throw new BadRequestException(
          'startBlock cannot be greater than endBlock.',
        );
      }

      // If a contract address is provided, check that the startBlock is after the contract's deployment block
      // if (contractAddress) {
      //   const deploymentInfo =
      //     await this.contractService.getContractDeploymentDetails(
      //       contractAddress,
      //       provider,
      //     );

      //   if (startBlock < deploymentInfo.blockNumber) {
      //     throw new BadRequestException(
      //       `startBlock must be greater than or equal to the contract deployment block number (${deploymentInfo.blockNumber}).`,
      //     );
      //   }
      // }
    }

    // Validate the contract address format if provided
    if (contractAddress && !ethers.isAddress(contractAddress)) {
      throw new BadRequestException('Invalid contract address.');
    }
  }

  public async getBlockTransactions(
    networkName: string,
    dto: GetBlockTransactionsRequestDto,
  ): Promise<BlockTransactionsResponseDto> {
    const {
      block_height,
      block_hash,
      date,
      currency = 'USD',
      page = 1,
      limit = 10,
    } = dto;
    try {
      const chainId = this.supportedNetworksService.getChainId(networkName);
      const provider = await this.ethersHelperService.getProvider(networkName);

      const finalBlockNumber = await this.getFinalBlockNumber({
        block_height,
        block_hash,
        date,
        provider,
      });

      let weiToUSD;
      try {
        //NOTE: to save on RPC calls and waiting time,
        // we can fetch the USD gas price for the start block of the range
        weiToUSD = await this.pricingService.getWeiToUSD(
          networkName,
          finalBlockNumber,
        );
        this.logger.debug(`Wei to USD: ${weiToUSD.toString()}`);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        // no conversion is available for this network, continue
      }

      const blockData = await provider.getBlock(finalBlockNumber);

      if (!blockData) {
        throw new NotFoundException('Block not found.');
      }

      const totalPages = Math.ceil(blockData.transactions.length / limit);

      if (page > totalPages || page < 1) {
        throw new BadRequestException('Invalid page number.');
      }

      const startIndex = (page - 1) * limit;
      const endIndex = Math.min(
        startIndex + limit,
        blockData.transactions.length,
      );

      const transactions: TransactionDetailsDto[] = [];
      for (let i = startIndex; i < endIndex; i++) {
        transactions.push(
          await this.transactionService.getTransactionDetails({
            provider,
            txHash: blockData.transactions[i],
            weiToUSD,
            currency,
          }),
        );
      }

      return {
        chain_id: chainId,
        network_name: networkName,
        page,
        limit,
        currency,
        previous:
          page > 1
            ? `https://api.histori.xyz/v1/${networkName}/chain/block/transactions?block_hash=${block_hash}&page=${page - 1}&limit=${limit}`
            : null,
        next:
          page < totalPages
            ? `https://api.histori.xyz/v1/${networkName}/chain/block/transactions?block_hash=${block_hash}&page=${page + 1}&limit=${limit}`
            : null,
        total_pages: totalPages,
        total_transactions: blockData.transactions.length,
        transactions,
      };
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Cannot fetch this block.');
    }
  }

  // Helper method to fetch logs from the blockchain
  private async fetchLogsFromBlockchain(
    filter: {
      address?: string;
      topics?: string[];
      fromBlock?: number;
      toBlock?: number | string;
      blockHash?: string;
    },
    provider: ethers.JsonRpcProvider,
  ): Promise<any> {
    // Fetch logs using the filter
    const logs = await provider.getLogs(filter);

    // Convert logs to LogDto format
    const logResponses: LogDto[] = logs.map((log: Log) => ({
      address: log.address,
      topics: log.topics,
      data: log.data,
      block_height: log.blockNumber,
      block_hash: log.blockHash,
      log_index: log.index,
      transaction_hash: log.transactionHash,
      transaction_index: log.transactionIndex,
      removed: log.removed,
    }));

    // Return the logs as a response
    return {
      logs: logResponses,
      total: logs.length,
    };
  }

  // Updated getLogs method using helper methods
  async getLogs(
    networkName: string,
    query: GetLogsRequestDto,
  ): Promise<LogResponseDto> {
    const { start_block, end_block, block_hash, topics, contract_address } =
      query;
    const chainId = await this.supportedNetworksService.getChainId(networkName);
    const provider = await this.ethersHelperService.getProvider(networkName);

    // Validate query parameters
    await this.validateLogQueryParameters(
      start_block,
      end_block,
      block_hash,
      contract_address,
    );

    // Build the filter for querying logs
    const filter = {
      address: contract_address,
      topics: topics,
      fromBlock: start_block,
      toBlock: end_block || 'latest',
      blockHash: block_hash,
    };

    // Fetch logs using the helper method
    const logResponses = await this.fetchLogsFromBlockchain(filter, provider);

    return {
      network_name: networkName,
      chain_id: chainId,
      count: logResponses.total,
      logs: logResponses.logs,
    };
  }

  // Updated getLogsByContractAddress method using helper methods
  async getLogsByContractAddress(
    networkName: string,
    contractAddress: string,
    query: GetLogsNoContractRequestDto,
  ): Promise<LogResponseDto> {
    const { start_block, end_block, block_hash } = query;
    const chainId = this.supportedNetworksService.getChainId(networkName);
    const provider = await this.ethersHelperService.getProvider(networkName);
    // Validate query parameters
    await this.validateLogQueryParameters(
      start_block,
      end_block,
      block_hash,
      contractAddress,
    );

    // Build the filter for querying logs
    const filter = {
      address: contractAddress,
      fromBlock: start_block,
      toBlock: end_block || 'latest',
      blockHash: block_hash,
    };

    // Fetch logs using the helper method
    const logResponses = await this.fetchLogsFromBlockchain(filter, provider);

    return {
      network_name: networkName,
      chain_id: chainId,
      count: logResponses.total,
      logs: logResponses.logs,
    };
  }

  // Updated getLogsByEventSignature method using helper methods
  async getLogsByEventSignature(options: {
    networkName: string;
    event_signature: string;
    start_block: number;
    end_block: number;
    block_hash: string;
    contract_address: string;
  }): Promise<LogResponseDto> {
    const {
      start_block,
      end_block,
      block_hash,
      contract_address,
      networkName,
      event_signature,
    } = options;

    const topicHash = ethers.id(event_signature);
    const chainId = await this.supportedNetworksService.getChainId(networkName);
    const provider = await this.ethersHelperService.getProvider(networkName);

    // Validate query parameters
    await this.validateLogQueryParameters(
      start_block,
      end_block,
      block_hash,
      contract_address,
    );

    // Build the filter for querying logs
    const filter = {
      address: contract_address,
      topics: [topicHash],
      fromBlock: start_block,
      toBlock: end_block || 'latest',
      blockHash: block_hash,
    };

    // Fetch logs using the helper method
    const logResponses = await this.fetchLogsFromBlockchain(filter, provider);

    return {
      network_name: networkName,
      chain_id: chainId,
      count: logResponses.total,
      logs: logResponses.logs,
    };
  }

  /**
   * Get the current block height
   */
  async getBlockHeight(networkName: string): Promise<BlockHeightResponseDto> {
    try {
      const chainId = this.supportedNetworksService.getChainId(networkName);
      const provider = await this.ethersHelperService.getProvider(networkName);

      return {
        chain_id: chainId,
        network_name: networkName,
        block_height: await provider.getBlockNumber(),
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new BadRequestException('Failed to fetch block height');
    }
  }

  async getGasPrice(options: {
    networkName: string;
    type?: string;
    gasLimit?: number;
    date?: string;
    block_height?: number;
    transaction_to?: string;
    transaction_from?: string;
    transaction_amount?: string;
    transaction_data?: string;
    transaction?: string;
  }): Promise<GasPriceResponseDto> {
    const {
      type,
      gasLimit,
      date,
      block_height,
      transaction_to,
      transaction_from,
      transaction_amount,
      transaction_data,
      transaction,
      networkName,
    } = options;

    const chainId = this.supportedNetworksService.getChainId(networkName);
    // Initialize the provider with the correct network

    const provider = await this.ethersHelperService.getProvider(networkName);

    const shouldCalculateExecutionCost = type || gasLimit;

    let estimatedGasUnits: bigint;
    if (type) {
      // Define gas units based on the type of transaction
      switch (type) {
        case 'native_transfer':
          estimatedGasUnits = BigInt(21000); // Standard gas for ETH transfers
          break;
        case 'erc20_transfer':
          estimatedGasUnits = BigInt(50000); // Approximate gas for ERC20 transfers
          break;
        case 'swap':
          estimatedGasUnits = BigInt(356190); // Gas estimate for swaps
          break;
        default:
          estimatedGasUnits = BigInt(1); // For a single gas unit
      }
    } else if (gasLimit) {
      estimatedGasUnits = BigInt(gasLimit);
    } else if (
      (transaction_to && transaction_amount) ||
      (transaction_to && transaction_data)
    ) {
      estimatedGasUnits = await provider.estimateGas({
        to: transaction_to,
        from: transaction_from,
        value: transaction_amount,
        data: transaction_data,
      });
    } else if (transaction) {
      const gas = (
        await this.transactionService.getTransactionDetails({
          txHash: Transaction.from(transaction).hash,
          provider,
        })
      ).gas_spent;
      estimatedGasUnits = BigInt(gas);
      this.logger.debug(`Estimated gas units: ${estimatedGasUnits}`);
    } else {
      estimatedGasUnits = BigInt(1); // For a single gas unit
    }

    try {
      let finalBlockNumber: number;
      // If timestamp is provided, convert it to block number
      if (date) {
        try {
          finalBlockNumber =
            await this.ethersHelperService.convertToBlockNumber(date, provider);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error: any) {
          throw new BadRequestException(
            'Timestamp is in the future or before the creation of the chain.',
          );
        }
      } else {
        // If no block number is provided, use the latest block
        finalBlockNumber =
          block_height !== undefined
            ? block_height
            : await provider.getBlockNumber();
      }

      let feeData;
      try {
        feeData = await provider.getFeeData();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        throw new NotFoundException('Gas Price data not available');
      }

      console.log(feeData); // Debugging
      // Get the current gas price and base fee from the provider
      const gasPrice = feeData.gasPrice;

      let response: GasPriceResponseDto = {
        chain_id: chainId, // Example: replace with actual chain ID
        network_name: networkName, // Network name (like eth-mainnet)
        block_height: finalBlockNumber,

        event_type: type,

        gas_required: estimatedGasUnits.toString(),

        gas_cost_wei: gasPrice.toString(),
        gas_cost_gwei: ethers.formatUnits(gasPrice, 'gwei'),
        gas_cost_eth: ethers.formatUnits(gasPrice, 'ether'),
      };

      if (feeData.baseFeePerGas) {
        response = {
          ...response,
          fee_wei: feeData.baseFeePerGas.toString(),
          fee_gwei: ethers.formatUnits(feeData.baseFeePerGas, 'gwei'),
          fee_eth: ethers.formatUnits(feeData.baseFeePerGas, 'ether'),
        };
      }

      if (feeData.maxPriorityFeePerGas) {
        response = {
          ...response,

          tip_wei: feeData.maxPriorityFeePerGas.toString(),
          tip_gwei: ethers.formatUnits(feeData.maxPriorityFeePerGas, 'gwei'),
          tip_eth: ethers.formatUnits(feeData.maxPriorityFeePerGas, 'ether'),
        };
      }

      let weiToUSD;
      try {
        weiToUSD = await this.pricingService.getWeiToUSD(
          networkName,
          finalBlockNumber,
        );
        const gasCost = weiToUSD.multipliedBy(gasPrice.toString());
        const gasCostInUSD = gasCost.toFixed(12);

        response = {
          ...response,
          currency: 'USD', // Example: Currency can be dynamically fetched or configured
          gas_cost: `$${gasCostInUSD.toString()}`,
        };

        let total = gasCost;

        if (shouldCalculateExecutionCost) {
          const executionCost = gasCost.multipliedBy(estimatedGasUnits);
          const executionCostInUSD = executionCost.toFixed(12);

          total = executionCost;

          response = {
            ...response,

            execution_cost: `$${executionCostInUSD.toString()}`,
          };
        }

        if (feeData.maxPriorityFeePerGas) {
          const tip = weiToUSD.multipliedBy(
            feeData.maxPriorityFeePerGas.toString(),
          );

          total = total.plus(tip);

          const tipInUSD = tip.toFixed(12);

          response = {
            ...response,
            tip_cost: `$${tipInUSD.toString()}`,
          };
        }
        if (feeData.maxFeePerGas) {
          const fee = weiToUSD.multipliedBy(feeData.maxFeePerGas.toString());
          const feeInUSD = fee.toFixed(12);

          total = total.plus(fee);

          response = {
            ...response,
            fee_cost: `$${feeInUSD.toString()}`,
          };
        }

        const totalUSD = total.toFixed(12);

        response = {
          ...response,
          total_cost: `$${totalUSD.toString()}`,
        };
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        // no conversion is available for this network, continue
      }

      return response;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Failed to fetch gas price');
    }
  }

  /**
   * Get a block by block number
   */
  async getBlock(
    networkName: string,
    dto: GetBlockRequestDto,
  ): Promise<BlockResponseDto> {
    const { block_height, block_hash, date, currency = 'USD' } = dto;
    try {
      const chainId = this.supportedNetworksService.getChainId(networkName);
      this.logger.debug(`Fetching block for ${networkName}`);
      const provider = await this.ethersHelperService.getProvider(networkName);

      //
      const finalBlockNumber = await this.getFinalBlockNumber({
        block_height,
        date,
        block_hash,
        provider,
      });

      let weiToUSD;
      try {
        //NOTE: to save on RPC calls and waiting time,
        // we can fetch the USD gas price for the start block of the range
        weiToUSD = await this.pricingService.getWeiToUSD(
          networkName,
          finalBlockNumber,
        );
        this.logger.debug(`Wei to USD: ${weiToUSD.toString()}`);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        // no conversion is available for this network, continue
      }

      const block: BlockDto = await this.getBlockInfo({
        block_hash,
        block_height,
        date,
        provider,
        weiToUSD,
        block_valuation_currency: currency,
      });
      // Format the block data into the desired structure
      const response: BlockResponseDto = {
        chain_id: chainId,
        network_name: networkName,
        block: block,
      };

      return response;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Cannot fetch this block.');
    }
  }

  private async getFinalBlockNumber(options: {
    block_height?: number;
    block_hash?: string;
    date?: string;
    provider: ethers.JsonRpcProvider;
  }): Promise<number> {
    const { block_height, block_hash, date, provider } = options;

    let finalBlockNumber: number;
    if (block_hash) {
      const blockByHash = await provider.getBlock(block_hash);
      if (!blockByHash) {
        throw new NotFoundException('Block not found.');
      }

      finalBlockNumber = blockByHash.number;
    }
    if (block_height) {
      finalBlockNumber = block_height;
    } else if (date) {
      finalBlockNumber = await this.ethersHelperService.convertToBlockNumber(
        date,
        provider,
      );
    } else {
      finalBlockNumber = await provider.getBlockNumber();
    }

    return finalBlockNumber;
  }

  private async getBlockInfo(options: {
    provider: ethers.JsonRpcProvider;
    block_height?: number;
    block_hash?: string;
    date?: string;
    weiToUSD?: bn;
    block_valuation_currency?: string;
    getTransactionHashes?: boolean;
  }): Promise<BlockDto> {
    const {
      provider,
      block_height,
      block_hash,
      date,
      weiToUSD,
      block_valuation_currency,
      getTransactionHashes,
    } = options;

    let blockData;
    let finalBlockNumber: number;
    if (block_hash) {
      // Fetch block by block hash
      blockData = await provider.getBlock(block_hash, getTransactionHashes);
    } else {
      finalBlockNumber = await this.getFinalBlockNumber({
        block_height,
        block_hash,
        date,
        provider,
      });
      blockData = await provider.getBlock(
        finalBlockNumber,
        getTransactionHashes,
      );
    }

    if (!blockData) {
      throw new NotFoundException('Block not found.');
    }

    return await this.prepareBlockData({
      blockData,
      finalBlockNumber,
      weiToUSD,
      block_valuation_currency,
    });
  }

  async getBlockRange(
    networkName: string,
    dto: GetBlockRangeRequestDto,
  ): Promise<BlockRangeResponseDto> {
    const {
      start_block_height,
      start_date,
      end_block_height,
      end_date,
      page = 1,
      limit = 10,
      currency = 'USD',
    } = dto;
    if (!start_block_height && !start_date) {
      throw new BadRequestException(
        'Start block height or date must be provided.',
      );
    }

    if (!end_block_height && !end_date) {
      throw new BadRequestException(
        'End block height or date must be provided.',
      );
    }

    if (start_block_height > end_block_height || start_date > end_date) {
      throw new BadRequestException(
        'Start block height or date must be before end block height or date.',
      );
    }
    try {
      const chainId = this.supportedNetworksService.getChainId(networkName);
      const provider = await this.ethersHelperService.getProvider(networkName);

      const startBlockNumber = start_block_height
        ? start_block_height
        : await this.ethersHelperService.convertToBlockNumber(
            start_date,
            provider,
          );

      const endBlockNumber = end_block_height
        ? end_block_height
        : await this.ethersHelperService.convertToBlockNumber(
            end_date,
            provider,
          );

      if (startBlockNumber > endBlockNumber) {
        throw new BadRequestException(
          'Start block number must be less than or equal to end block number.',
        );
      }

      const totalBlocks = endBlockNumber - startBlockNumber + 1;
      const totalPages = Math.ceil(totalBlocks / limit);

      if (page > totalPages || page < 1) {
        throw new BadRequestException('Invalid page number.');
      }

      const startIndex = (page - 1) * limit;
      const endIndex = Math.min(startIndex + limit, totalBlocks);

      let weiToUSD;
      try {
        //NOTE: to save on RPC calls and waiting time,
        // we can fetch the USD gas price for the start block of the range
        weiToUSD = await this.pricingService.getWeiToUSD(
          networkName,
          startBlockNumber,
        );
        this.logger.debug(`Wei to USD: ${weiToUSD.toString()}`);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        // no conversion is available for this network, continue
      }

      const blocks: BlockDto[] = [];
      for (let i = startIndex; i < endIndex; i++) {
        const blockNumber = startBlockNumber + i;
        blocks.push(
          await this.getBlockInfo({
            provider,
            block_height: blockNumber,
            weiToUSD,
            block_valuation_currency: currency,
          }),
        );
      }

      // Construct next and previous URLs
      const baseUrl = `https://api.histori.xyz/v1/${networkName}/blocks`;
      const buildQueryParams = (extraParams: Record<string, any>) => {
        const params: Record<string, string> = {
          ...(start_date && { start_date }),
          ...(end_date && { end_date }),
          ...(start_block_height && {
            start_block_height: start_block_height.toString(),
          }),
          ...(end_block_height && {
            end_block_height: end_block_height.toString(),
          }),
          limit: limit.toString(),
          currency,
          ...extraParams,
        };

        return new URLSearchParams(params).toString();
      };

      // Format the block data into the desired structure
      const response: BlockRangeResponseDto = {
        chain_id: chainId,
        network_name: networkName,
        page,
        limit,
        total_pages: totalPages,
        total_results: totalBlocks,
        currency: currency,
        next:
          page < totalPages
            ? `${baseUrl}?${buildQueryParams({ page: (page + 1).toString() })}`
            : null,
        previous:
          page > 1
            ? `${baseUrl}?${buildQueryParams({ page: (page - 1).toString() })}`
            : null,
        blocks: blocks,
      };

      return response;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Cannot fetch this block.');
    }
  }

  private async prepareBlockData(options: {
    blockData: any;
    finalBlockNumber: number;
    weiToUSD: bn;
    block_valuation_currency: string;
    transaction_hashes?: Array<string>;
  }): Promise<BlockDto> {
    const {
      blockData,
      weiToUSD,
      block_valuation_currency,
      transaction_hashes,
    } = options;

    let blockDto: any = {
      block_hash: blockData.hash,
      signed_at: new Date(blockData.timestamp * 1000),
      signed_at_timestamp: blockData.timestamp,
      block_height: blockData.number,
      block_parent_hash: blockData.parentHash,
      extra_data: blockData.extraData,
      miner_address: blockData.miner,
      gas_used: blockData.gasUsed.toString(),
      gas_limit: blockData.gasLimit.toString(),
      transactions_link: `https://api.etherscan.io/${blockData.hash}/transactions`,
      transaction_count: blockData.transactions.length,
    };

    if (transaction_hashes) {
      blockDto = {
        ...blockDto,
        transaction_hashes,
      };
    }

    if (weiToUSD && block_valuation_currency) {
      const blockCost = weiToUSD
        .multipliedBy(blockData.gasUsed.toString())
        .toFixed(12);

      const currencySymbol = this.currencyService.getCurrencySymbol(
        block_valuation_currency,
      );
      const block_valuation = `${currencySymbol}${blockCost}`;

      blockDto = {
        ...blockDto,
        block_valuation_currency,
        block_valuation,
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    }

    return blockDto;
  }
}
