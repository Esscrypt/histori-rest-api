import { ApiProperty } from '@nestjs/swagger';

export class TokenSupplyResponseDto {
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
      'Token unique identifier (contract address) in hexadecimal format',
    example: '0x6b175474e89094c44da98b954eedeac495271d0f',
  })
  token_address: string;

  @ApiProperty({
    description: 'Block number at the time of the snapshot',
    example: 20980367,
  })
  block_height: number;

  @ApiProperty({
    description: 'Total supply of the token at the given block number',
    example: '3361990858936672881079063694',
  })
  total_supply: string;
}
