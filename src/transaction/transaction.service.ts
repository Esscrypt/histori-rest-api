import { Injectable, BadRequestException } from '@nestjs/common';
import { ethers } from 'ethers';

@Injectable()
export class TransactionService {
  /**
   * Fetch transaction details for a given transaction hash
   */
  async getTransactionDetails(
    networkName: string,
    txHash: string,
  ): Promise<any> {
    try {
      const provider: ethers.JsonRpcProvider = new ethers.JsonRpcProvider(
        process.env[`RPC_URL_${networkName.toUpperCase()}`],
      );

      const tx = await provider.getTransaction(txHash);
      if (!tx) {
        throw new BadRequestException('Transaction not found');
      }

      const txReceipt = await provider.getTransactionReceipt(txHash);
      const block = await provider.getBlock(tx.blockNumber);

      const transactionDetails = {
        updated_at: new Date().toISOString(),
        chain_id: tx.chainId,
        chain_name: networkName,
        items: [
          {
            block_signed_at: new Date(block.timestamp * 1000).toISOString(),
            block_height: block.number,
            block_hash: block.hash,
            tx_hash: tx.hash,
            tx_offset: tx.index,
            successful: txReceipt.status === 1,
            from_address: tx.from,
            miner_address: block.miner,
            to_address: tx.to,
            value: ethers.formatUnits(tx.value, 'ether'),
            gas_offered: tx.gasLimit.toString(),
            gas_spent: txReceipt.gasUsed.toString(),
            gas_price: ethers.formatUnits(tx.gasPrice, 'gwei'),
            fees_paid: ethers.formatUnits(
              tx.gasPrice * txReceipt.gasUsed,
              'ether',
            ),
            gas_metadata: {
              contract_decimals: 18,
              contract_name: 'Ether',
              contract_ticker_symbol: 'ETH',
              contract_address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', // Ether default
            },
            explorers: [
              {
                label: 'Etherscan',
                url: `https://etherscan.io/tx/${tx.hash}`,
              },
            ],
            log_events: txReceipt.logs.map((log) => ({
              block_signed_at: new Date(block.timestamp * 1000).toISOString(),
              block_height: block.number,
              tx_offset: tx.index,
              log_offset: log.index,
              tx_hash: tx.hash,
              raw_log_topics: log.topics,
              sender_address: log.address,
              raw_log_data: log.data,
            })),
          },
        ],
      };

      return transactionDetails;
    } catch (error) {
      throw new BadRequestException(
        `Failed to fetch transaction details: ${error.message}`,
      );
    }
  }
}
