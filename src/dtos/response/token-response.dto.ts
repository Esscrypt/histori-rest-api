import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TokenResponseDto {
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
    description: 'The contract address of the token.',
    example: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  })
  token_address: string;

  @ApiProperty({
    description: 'The block number at which the token was created.',
    example: 12345678,
  })
  block_height: number;

  @ApiProperty({
    description: 'The type of the token (erc20, erc777, etc.).',
    example: 'erc20',
  })
  token_type: string;

  @ApiProperty({
    description: 'The name of the token.',
    example: 'Wrapped Ether',
  })
  name: string;

  @ApiProperty({
    description: 'The symbol of the token.',
    example: 'WETH',
  })
  symbol: string;

  @ApiPropertyOptional({
    description: 'The number of decimals for an ERC20 token (optional).',
    example: 18,
    required: false,
  })
  decimals?: number;

  @ApiPropertyOptional({
    description: 'The granularity of an ERC777 token (optional).',
    example: '1',
    required: false,
  })
  granularity?: string;
}
