import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UniswapV3TokenInfoDto {
  @ApiProperty({
    description: 'The token address.',
    example: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  })
  address: string;

  @ApiProperty({ description: 'The name of the token.', example: 'USD Coin' })
  name: string;

  @ApiProperty({ description: 'The symbol of the token.', example: 'USDC' })
  symbol: string;

  @ApiProperty({
    description: 'The number of decimals of the token.',
    example: '6',
  })
  decimals: string;
}

export class UniswapV3PoolInfoResponseDto {
  @ApiProperty({ description: 'The network name.', example: 'eth-mainnet' })
  network_name: string;

  @ApiProperty({ description: 'The chain ID of the network.', example: 1 })
  chain_id: number;

  @ApiProperty({
    description: 'The pool address.',
    example: '0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8',
  })
  pool_address: string;

  @ApiProperty({
    description: 'The token pair addresses.',
    example:
      '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48/0x6b175474e89094c44da98b954eedeac495271d0f',
  })
  pair_addresses: string;

  @ApiProperty({ description: 'The token pair symbols.', example: 'USDC/DAI' })
  pair_symbols: string;

  // TODO: after rate is calculated, make it not optional
  @ApiPropertyOptional({
    description: 'The exchange rate between the tokens.',
    example: '1.002345',
  })
  rate?: string;

  @ApiProperty({
    description:
      'Fee tier of the pool (e.g., 500, 3000, 10000). corresponding to 0.05%, 0.3% adn 1%',
    example: '500',
  })
  fee: string;

  @ApiProperty({
    description:
      'Fee tier of the pool (e.g., 500, 3000, 10000). corresponding to 0.05%, 0.3% adn 1%',
    example: '0.05%',
  })
  fee_percentage: string;

  @ApiProperty({
    description: 'Liquidity of the pool',
    example: '10000000000000000000',
  })
  liquidity: string;

  @ApiProperty({
    description: 'The liquidity of the pool (denominated in ETH).',
    example: '10',
  })
  liquidity_eth: string;

  @ApiProperty({ description: 'Details of the first token in the pair.' })
  token0: UniswapV3TokenInfoDto;

  @ApiProperty({ description: 'Details of the second token in the pair.' })
  token1: UniswapV3TokenInfoDto;
}
