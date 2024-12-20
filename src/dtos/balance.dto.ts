import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class BalanceDto {
  @ApiProperty({
    description: 'Wallet address of the token holder in hexadecimal format',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  holder: string; // Hex format of the wallet address

  @ApiProperty({
    description: 'Token contract address in hexadecimal format',
    example: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    type: String,
  })
  contractAddress: string; // Hex format of the token address

  @ApiProperty({
    description: 'The balance of the token',
    example: '1000000000000000000',
    type: String,
  })
  balance: string; // Balance amount as a string

  @ApiProperty({
    description: 'Block number at the time the balance was recorded',
    example: 123456,
    type: Number,
  })
  blockNumber: number;

  @ApiProperty({
    description: 'Token ID for ERC721 tokens (optional)',
    example: 1,
    nullable: true,
    type: String,
  })
  @IsOptional()
  tokenId?: string;
}
