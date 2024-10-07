import { ApiProperty } from '@nestjs/swagger';

export class AllowanceDto {
  @ApiProperty({ description: 'The ENS name or address of the owner.' })
  owner: string;

  @ApiProperty({ description: 'The ENS name or address of the spender.' })
  spender: string;

  @ApiProperty({
    description: 'The contract address of the token in hexadecimal format.',
  })
  tokenAddress: string;

  @ApiProperty({
    description: 'The block number for which the allowance is requested.',
  })
  blockNumber: number;
}
