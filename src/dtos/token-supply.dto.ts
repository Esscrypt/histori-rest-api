import { ApiProperty } from '@nestjs/swagger';

export class TokenSupplyDto {
  @ApiProperty({
    description: 'Token contract address in hexadecimal format',
    example: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
  })
  contractAddress: string;

  @ApiProperty({
    description: 'Block number at the time of the snapshot',
    example: 123456,
  })
  blockNumber: number;

  @ApiProperty({
    description: 'Total supply of the token at the given block number',
    example: '1000000000000000000',
  })
  totalSupply: string;
}
