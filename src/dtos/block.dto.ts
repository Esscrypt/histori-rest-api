import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BlockDto {
  @ApiProperty({
    description: 'The hash of the block.',
    example:
      '0xa8c5c67a5d5a9b19fed27d6b290857ab4e389e73d41683ef1af80e1ddef337c5',
  })
  block_hash: string;

  @ApiProperty({
    description: 'The block signed time in ISO format.',
    example: '2024-10-12T16:35:47.000Z',
  })
  signed_at: Date;

  @ApiProperty({
    description: 'The block signed timestamp (in seconds since epoch).',
    example: 1728750947,
  })
  signed_at_timestamp: number;

  @ApiProperty({
    description: 'The block height (block number).',
    example: 20950751,
  })
  block_height: number;

  @ApiProperty({
    description: 'The hash of the parent block.',
    example:
      '0xdaaa889de9758c641b32b118913f62f9c39e19b90f90a90ab4559ebbeab96d35',
  })
  block_parent_hash: string;

  @ApiProperty({
    description: 'The extra data attached to the block.',
    example: '0x6265617665726275696c642e6f7267',
  })
  extra_data: string;

  @ApiProperty({
    description: 'The address of the miner who produced the block.',
    example: '0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5',
  })
  miner_address: string;

  @ApiProperty({
    description: 'The total amount of gas used in the block.',
    example: 11873017,
  })
  gas_used: number;

  @ApiProperty({
    description: 'The gas limit of the block.',
    example: 30000000,
  })
  gas_limit: number;

  @ApiProperty({
    description: 'The number of transactions in the block.',
    example: 1,
  })
  transaction_count: number;

  @ApiPropertyOptional({
    description: 'The hashes of each transaction in the block.',
    example: [
      '0x9f8e7f7d9d7c1f3b3b7f8f7d9d7c1f3b3b7f8f7d9d7c1f3b3b7f8f7d9d7c1f3b',
      '0x9f8e7f7d9d7c1f3b3b7f8f7d9d7c1f3b3b7f8f7d9d7c1f3b3b7f8f7d9d7c1f3b',
    ],
  })
  transaction_hashes?: string[];

  @ApiProperty({
    description: 'The link to the transactions in the block.',
    example:
      'https://api.histori.xyz/v1/eth-mainnet/blocks/20950751/transactions',
  })
  transactions_link: string;

  @ApiPropertyOptional({
    description: 'The cost of the block gas in USD.',
    example: '$0.031124',
  })
  block_valuation?: string;

  @ApiPropertyOptional({
    description: 'The currency of the block valuation.',
    example: 'USD',
  })
  block_valuation_currency?: string;
}
