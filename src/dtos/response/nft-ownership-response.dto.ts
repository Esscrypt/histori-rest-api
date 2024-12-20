import { ApiProperty } from '@nestjs/swagger';

export class NFTOwnershipResponseDto {
  @ApiProperty({
    description: 'Blockchain network name For the requested query',
    example: 'eth-mainnet',
  })
  network_name: string;

  @ApiProperty({
    description: 'The chain ID of the network.',
    example: 1,
  })
  chain_id: number;

  @ApiProperty({
    description:
      'A boolean indicating whether the address owns the specified token.',
    example: true,
  })
  is_owner: boolean;

  @ApiProperty({
    description: 'The owner address of the NFT.',
    example: '0xd5470BaFb6074B10107b303D0cCe03cA5539b6E3',
  })
  owner: string;

  @ApiProperty({
    description: 'The token ID for the specific NFT.',
    example: 1,
  })
  token_id: number;

  @ApiProperty({
    description: 'The block number for which the allowance is requested.',
    example: 20853281,
  })
  checked_at_block: number;

  @ApiProperty({
    description:
      'Timestamp for which the allowance is queried (ISO 8601 format).',
    example: '2024-10-17T09:03:59.000Z',
  })
  checked_at_date: string;
}
