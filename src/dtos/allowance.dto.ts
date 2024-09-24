import { ApiProperty } from '@nestjs/swagger';

export class AllowanceDto {
  @ApiProperty({
    description: "Owner's wallet address in hexadecimal format",
    example: '0x1234567890abcdef1234567890abcdef12345678',
    type: String,
  })
  ownerAddress: string; // Hexadecimal string for the owner address

  @ApiProperty({
    description: "Spender's wallet address in hexadecimal format",
    example: '0x789012345678901234567890abcdefabcdefabcd',
    type: String,
  })
  spenderAddress: string; // Hexadecimal string for the spender address

  @ApiProperty({
    description: 'Token contract address in hexadecimal format',
    example: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    type: String,
  })
  tokenAddress: string; // Hexadecimal string for the token address

  @ApiProperty({
    description: 'Block number at the time the allowance was recorded',
    example: 123456,
    type: Number,
  })
  blockNumber: number;

  @ApiProperty({
    description: 'Allowance amount',
    example: '1000000000000000000',
    type: String,
    nullable: true,
  })
  allowance?: string;

  @ApiProperty({
    description: 'Token ID for ERC721/ERC1155 tokens (optional)',
    example: 1,
    type: Number,
    nullable: true,
  })
  tokenId?: number;

  @ApiProperty({
    description: 'Token type (e.g., ERC20, ERC721, etc.)',
    example: 'ERC20',
    type: String,
  })
  tokenType: string;
}
