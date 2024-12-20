import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Min } from 'class-validator';

export class TokenDto {
  @ApiProperty({
    description: 'Token contract address in hexadecimal format',
    example: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
  })
  token_address: string;

  @ApiPropertyOptional({
    description: 'Block number at the time of token creation',
    example: 123456,
  })
  @Min(1)
  block_height?: number;

  @ApiProperty({
    description: 'Type of the token (e.g., ERC20, ERC721, ERC777, ERC1155)',
    example: 'ERC20',
  })
  token_type: string;

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
