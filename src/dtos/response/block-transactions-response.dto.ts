import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionDetailsDto } from '../transaction-details.dto';

export class BlockTransactionsResponseDto {
  @ApiProperty({
    description: 'The blockchain network name (e.g., eth-mainnet).',
    example: 'eth-mainnet',
  })
  network_name: string;

  @ApiProperty({
    description:
      'The ID of the blockchain network (e.g., Ethereum mainnet is 1).',
    example: 1,
  })
  chain_id: number;

  @ApiProperty({
    description: 'The fiat currency used for the conversion',
    example: 'USD',
  })
  currency: string;

  @ApiProperty({
    description: 'The current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'The number of blocks returned per page',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: 'The total number of transactions in the requested block',
    example: 100,
  })
  total_transactions: number;

  @ApiProperty({
    description: 'The total number of pages for the requested range',
    example: 10,
  })
  total_pages: number;

  @ApiPropertyOptional({
    description: 'Link to the next page of transactions',
    example:
      'https://api.histori.xyz/v1/eth-mainnet/chain/block/transactions?block_hash=0xd4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3&page=3&limit=10',
  })
  next?: string;

  @ApiPropertyOptional({
    description: 'Link to the previous page of transactions',
    example:
      'https://api.histori.xyz/v1/eth-mainnet/chain/block/transactions?block_hash=0xd4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3&page=1&limit=10',
  })
  previous?: string;

  @ApiProperty({
    description: 'The list of transactions with their details.',
    type: [TransactionDetailsDto],
  })
  transactions: TransactionDetailsDto[];
}
