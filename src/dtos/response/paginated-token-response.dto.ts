import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TokenDto } from '../token.dto';

export class PaginatedTokensResponseDto {
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
    description: 'The current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'The number of tokens returned per page',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: 'The total number of Tokens.',
    example: 100,
  })
  total_results: number;

  @ApiProperty({
    description: 'The total number of pages for the requested range',
    example: 10,
  })
  total_pages: number;

  @ApiPropertyOptional({
    description: 'Link to the next page of tokens',
    example: 'https://api.histori.xyz/v1/eth-mainnet/tokens?page=2&limit=10',
  })
  next?: string;

  @ApiPropertyOptional({
    description: 'Link to the previous page of tokens',
    example: 'https://api.histori.xyz/v1/eth-mainnet/tokens?page=1&limit=10',
  })
  previous?: string;

  @ApiProperty({
    description: 'The list of tokens for the current page',
    type: [TokenDto],
  })
  tokens: TokenDto[];
}
