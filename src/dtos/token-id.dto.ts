import { ApiProperty } from '@nestjs/swagger';

export class TokenIDDto {
  @ApiProperty({
    description: 'Contract address in hexadecimal format (20 bytes)',
    example: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
  })
  contractAddress: string;

  @ApiProperty({
    description: 'Token ID for ERC721/1155 tokens',
    example: 1,
  })
  tokenId: number;

  @ApiProperty({
    description: 'Optional URI for token metadata',
    example: 'https://metadata.example.com/token/1',
    nullable: true,
  })
  tokenUri?: string;
}
