import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BlockDto } from '../block.dto';

export class BlockRangeResponseDto {
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
    description: 'The total number of blocks for the requested range',
    example: 100,
  })
  total_results: number;

  @ApiProperty({
    description: 'The total number of pages for the requested range',
    example: 10,
  })
  total_pages: number;

  @ApiPropertyOptional({
    description: 'Link to the next page of blocks',
    example:
      'https://api.histori.xyz/v1/eth-mainnet/blocks/2024:01:01/20204:02:01?page=2&limit=10',
  })
  next?: string;

  @ApiPropertyOptional({
    description: 'Link to the previous page of tokens',
    example: 'https://api.histori.xyz/v1/eth-mainnet/tokens?page=1&limit=10',
  })
  previous?: string;

  @ApiProperty({
    description: 'The list of blocks for the requested range',
    type: [BlockDto],
  })
  blocks: BlockDto[];
}
