import { ApiProperty } from '@nestjs/swagger';

export class BlockHeightResponseDto {
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

  @ApiProperty({ description: 'The current block height (number).' })
  block_height: number;
}
