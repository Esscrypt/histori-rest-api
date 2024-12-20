import { ApiProperty } from '@nestjs/swagger';

export class UniswapV4PoolInfoResponseDto {
  @ApiProperty({
    description: 'The address of the pool.',
    example: '0xPoolAddress',
  })
  pool_address: string;

  @ApiProperty({ description: 'The token0 details.' })
  token0: {
    address: string;
    name: string;
    symbol: string;
    decimals: string;
  };

  @ApiProperty({ description: 'The token1 details.' })
  token1: {
    address: string;
    name: string;
    symbol: string;
    decimals: string;
  };

  @ApiProperty({ description: 'The fee tier of the pool.', example: '3000' })
  fee: string;

  @ApiProperty({
    description: 'The fee tier as a percentage.',
    example: '0.3%',
  })
  fee_percentage: string;

  @ApiProperty({
    description: 'The current liquidity in the pool.',
    example: '1000000000',
  })
  liquidity: string;

  @ApiProperty({
    description: 'The liquidity converted to ETH.',
    example: '1.0',
  })
  liquidity_eth: string;

  @ApiProperty({
    description: 'The current price of token1 in terms of token0.',
    example: '1.234567',
  })
  price: string;

  @ApiProperty({
    description: 'Hooks associated with the pool.',
    example: ['0xHookAddress1', '0xHookAddress2'],
  })
  hooks: string[];
}
