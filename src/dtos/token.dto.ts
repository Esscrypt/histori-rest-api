import { ApiProperty } from '@nestjs/swagger';

export class TokenDto {
  @ApiProperty({
    description: 'Token contract address in hexadecimal format',
    example: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
  })
  contractAddress: string;

  @ApiProperty({
    description: 'Block number at the time of token creation',
    example: 123456,
  })
  blockNumber: number;

  @ApiProperty({
    description: 'Type of the token (e.g., ERC20, ERC721, ERC777, ERC1155)',
    example: 'ERC20',
  })
  tokenType: string;

  @ApiProperty({
    description: 'Token name (required for all token types)',
    example: 'My Token',
  })
  name: string;

  @ApiProperty({
    description: 'Token symbol (required for all token types)',
    example: 'MTK',
  })
  symbol: string;

  @ApiProperty({
    description: 'Number of decimals for ERC20 tokens',
    example: 18,
  })
  decimals?: number;

  @ApiProperty({
    description: 'Granularity for ERC777 tokens',
    example: '1',
    nullable: true,
  })
  granularity?: string;
}
