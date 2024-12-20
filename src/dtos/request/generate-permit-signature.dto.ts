import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GeneratePermitSignatureDto {
  @ApiProperty({
    description: 'The name of the token (e.g., DAI).',
    example: 'DAI',
  })
  token_name: string;

  @ApiPropertyOptional({
    description:
      'The chain ID of the network. If not provided, the chain ID will be inferred from the network name.',
    example: 1,
  })
  chain_id?: number;

  @ApiProperty({
    description: 'The contract address of the ERC20 token.',
    example: '0x6b175474e89094c44da98b954eedeac495271d0f',
  })
  contract_address: string;

  @ApiProperty({
    description: 'The address of the token owner.',
    example: '0xa24D38b1B49E32c1c63731810a8D42ec9dd9aa8C',
  })
  owner: string;

  @ApiProperty({
    description: 'The address allowed to spend the tokens.',
    example: '0x858646372CC42E1A627fcE94aa7A7033e7CF075A',
  })
  spender: string;

  @ApiProperty({
    description: 'The amount of tokens to permit (in token units).',
    example: '1000000000000000000', // 1 token (with 18 decimals)
  })
  value: string;

  @ApiProperty({
    description: 'The deadline for the permit (as a timestamp).',
    example: 1699999999,
  })
  deadline: number;
}
