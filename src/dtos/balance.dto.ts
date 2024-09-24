import { ApiProperty } from '@nestjs/swagger';

export class BalanceDto {
  @ApiProperty({
    description: 'Wallet address of the token holder in hexadecimal format',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  walletAddress: string; // Hex format of the wallet address

  @ApiProperty({
    description: 'Token contract address in hexadecimal format',
    example: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
  })
  tokenAddress: string; // Hex format of the token address

  @ApiProperty({
    description: 'The balance of the token',
    example: '1000000000000000000',
  })
  balance: string; // Balance amount as a string

  @ApiProperty({
    description: 'Block number at the time the balance was recorded',
    example: 123456,
  })
  blockNumber: number;

  @ApiProperty({
    description: 'Token ID for ERC721 tokens (optional)',
    example: 1,
    nullable: true,
  })
  tokenId?: number;

  @ApiProperty({
    description: 'Type of the token (e.g., ERC20, ERC721)',
    example: 'ERC20',
  })
  tokenType: string;
}
