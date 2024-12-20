import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class AllowanceResponseDto {
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
    example: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
  })
  token_address: string;

  @ApiProperty({
    description: 'The name of the token.',
    example: 'Liquid staked Ether 2.0',
  })
  token_name: string;

  @ApiProperty({
    description: 'The symbol of the token.',
    example: 'stETH',
  })
  token_symbol: string;

  @ApiProperty({
    description: 'The ERC standard of the Token (erc20 or erc777)',
    example: 'erc20',
  })
  @IsEnum(['erc20', 'erc777'])
  token_type: 'erc20' | 'erc777';

  @ApiProperty({
    description: 'The address of the owner.',
    example: '0xa24D38b1B49E32c1c63731810a8D42ec9dd9aa8C',
  })
  owner: string;

  @ApiProperty({
    description: 'The address of the spender.',
    example: '0x858646372CC42E1A627fcE94aa7A7033e7CF075A',
  })
  spender: string;

  @ApiPropertyOptional({
    description:
      'The allowance amount of the token, as a string. The amount is in the smallest unit of the token.',
    example:
      '115792089237316195423570985008687907853269984665640564039457584007913129639935',
  })
  allowance: string;

  @ApiPropertyOptional({
    description:
      'The allowance amount of the token, as a string, denominated in ether',
    example:
      '115792089237316195423570985008687907853269984665640564039457,584007913129639935',
  })
  allowance_eth: string;

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
