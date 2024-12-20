import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { ethers, Transaction } from 'ethers';
import networks from 'networks.json'; // Assuming networks.json is in src/config directory
import { LogEventDto } from 'src/dtos/log-event.dto';
import { TransactionDetailsDto } from 'src/dtos/transaction-details.dto';
import bn from 'bignumber.js';
import { CurrencyService } from 'src/services/currency.service';

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(private currencyService: CurrencyService) {}

  /**
   * Fetch transaction details for a given transaction hash
   */
  async getTransactionDetails(options: {
    txHash: string;
    provider: ethers.JsonRpcProvider;
    weiToUSD?: bn;
    currency?: string;
    fetch_logs?: boolean;
  }): Promise<TransactionDetailsDto> {
    const { txHash, provider, weiToUSD, currency, fetch_logs } = options;
    const tx = await provider.getTransaction(txHash);
    if (!tx) {
      throw new NotFoundException('Transaction not found');
    }

    try {
      const txReceipt = await provider.getTransactionReceipt(txHash);
      const block = await provider.getBlock(tx.blockNumber);

      // Fetch the blockExplorer URL based on the chainId
      const chainId = Number((await provider.getNetwork()).chainId);
      const network = networks.find((net) => net.chainId === chainId);
      this.logger.log(`Transaction: ${JSON.stringify(tx)}`);

      let transactionDetails: TransactionDetailsDto = {
        block_signed_at: new Date(block.timestamp * 1000).toISOString(),
        block_height: block.number,
        block_hash: block.hash,
        transaction_raw: Transaction.from(tx).serialized,
        tx_hash: tx.hash,
        tx_index: tx.index,
        successful: txReceipt.status === 1,
        from: tx.from,
        miner: block.miner, // TODO: maybe add this field conditionally
        to: tx.to,
        value: ethers.formatUnits(tx.value, 'ether'),
        gas_offered: tx.gasLimit.toString(),
        gas_spent: txReceipt.gasUsed.toString(),
        gas_price: ethers.formatUnits(tx.gasPrice, 'gwei'),
        fees_paid: ethers.formatUnits(tx.gasPrice * txReceipt.gasUsed, 'ether'),
        input_data: tx.data,
      };

      if (fetch_logs && txReceipt.logs) {
        const logEvents: LogEventDto[] = txReceipt.logs.map((log) => ({
          log_index: log.index,
          raw_log_topics: log.topics,
          sender_address: log.address,
          raw_log_data: log.data,
        }));

        transactionDetails = {
          ...transactionDetails,
          log_events: logEvents,
        };
      }

      if (network.blockExplorer) {
        const explorerUrl = `${network.blockExplorer}tx/${tx.hash}`;
        transactionDetails = {
          ...transactionDetails,
          explorer_url: explorerUrl,
        };
      }

      if (weiToUSD && currency) {
        // convert the target currency to USD
        const weiCostInTargetCurrency = this.currencyService.convertAmountUSD(
          weiToUSD,
          currency,
        );

        const transactionCostUSD = weiCostInTargetCurrency
          .multipliedBy(txReceipt.gasUsed.toString())
          .multipliedBy(tx.gasPrice.toString())
          .toFixed(12);

        const currencySymbol = this.currencyService.getCurrencySymbol(currency);

        const cost_formatted = `${currencySymbol}${transactionCostUSD}`;

        transactionDetails = {
          ...transactionDetails,
          transaction_cost: cost_formatted,
        };
      }

      return transactionDetails;
    } catch (error) {
      throw new BadRequestException(
        `Failed to fetch transaction details: ${error.message}`,
      );
    }
  }

  async createMulticall(options: {
    provider: ethers.JsonRpcProvider;
    encodedCalls: string[];
    allowFailure: boolean;
    chainId: number;
  }): Promise<{ to: string; data: string; value: string }> {
    const { provider, encodedCalls, chainId, allowFailure } = options;

    // Multicall contract address (based on network)
    const multicallAddress = this.getMulticallAddress(chainId);

    if (!multicallAddress) {
      throw new Error(
        `Multicall contract not supported for chain ID ${chainId}`,
      );
    }

    // ABI for Multicall's aggregate function
    const multicallAbi = [
      'function aggregate(tuple(address to, bytes data)[] calls) public view returns (uint256 blockNumber, bytes[] memory returnData)',
      'function aggregate3Value(tuple(address to, bool allowFailure, uint256 value, bytes callData)[] calls) public view returns (uint256 blockNumber, bytes[] memory returnData)',
    ];

    const multicallContract = new ethers.Contract(
      multicallAddress,
      multicallAbi,
      provider,
    );

    // Decode the RLP-encoded transactions to get their `to` and `data` fields
    const calls = encodedCalls.map((encoded) => {
      const decoded = ethers.Transaction.from(encoded);
      const to = decoded.to; // 'to' address
      const data = decoded.data || '0x'; // 'data' payload
      const value = decoded.value || '0x'; // 'value' payload
      return { to, data, value, allowFailure };
    });

    // Generate a call to the multicall's aggregate function
    const txData = multicallContract.interface.encodeFunctionData('aggregate', [
      calls,
    ]);

    return {
      to: multicallAddress,
      data: txData,
      value: '0',
    };
  }

  private getMulticallAddress(chainId: number): string | null {
    const multicallAddresses: Record<number, string> = {
      1: '0xeefBa1e63905eF1d7ACBA5a8513c70307C1cE441', // Mainnet
      137: '0x275617327c958bD06b5D6b871E7f491D76113dd8', // Polygon
      // Add other networks as needed
    };

    return multicallAddresses[chainId] || null;
  }
}
