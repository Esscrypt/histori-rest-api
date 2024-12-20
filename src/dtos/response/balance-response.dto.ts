import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class BalanceResponseDto {
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
    description: 'The contract address of the token in hexadecimal format.',
    example: '0xF2ec4a773ef90c58d98ea734c0eBDB538519b988',
  })
  token_address: string;

  @ApiProperty({
    description: 'The name of the token.',
    example: 'Doge 2.0',
  })
  token_name: string;

  @ApiProperty({
    description: 'The symbol of the token.',
    example: 'DOGE2.0',
  })
  token_symbol: string;

  @ApiProperty({
    description: 'The ERC standard of the Token (erc20 or erc777)',
    example: 'erc20',
  })
  @IsEnum(['erc20', 'erc777'])
  token_type: 'erc20' | 'erc777';

  @ApiProperty({
    description: 'The address of the token holder.',
    example: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  })
  holder: string;

  @ApiProperty({
    description: 'The balance amount of the holder for the token in wei.',
    example: '42570000000000000000',
    type: String,
  })
  balance: string; // Balance amount as a string

  @ApiProperty({
    description:
      'The balance amount of the holder for the token denominated in ether.',
    example: '42,57',
    type: String,
  })
  balance_eth: string; // Balance amount as a string

  @ApiProperty({
    description: 'The block number for which the balance is requested.',
    example: 20853281,
  })
  checked_at_block: number;

  @ApiProperty({
    description:
      'Timestamp for which the balance is queried (ISO 8601 format).',
    example: '2024-09-29T02:22:23.000Z',
  })
  checked_at_date: string;
}
