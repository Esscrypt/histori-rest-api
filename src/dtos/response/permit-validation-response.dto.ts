import { ApiProperty } from '@nestjs/swagger';

export class ValidationResponseDto {
  @ApiProperty({
    description: 'Indicates if the signature is valid.',
    example: true,
  })
  is_valid: boolean;

  @ApiProperty({
    description: 'The blockchain network name.',
    example: 'eth-mainnet',
  })
  network_name: string;

  @ApiProperty({
    description: 'The chain ID of the blockchain network.',
    example: 1,
  })
  chain_id: number;

  @ApiProperty({
    description: 'The owner of the tokens.',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  owner: string;

  @ApiProperty({
    description: 'The address of the spender allowed to spend the tokens.',
    example: '0xabcdefabcdefabcdefabcdefabcdefabcdef1234',
  })
  spender: string;

  @ApiProperty({
    description: 'The amount of tokens to be spent (in Wei).',
    example: '1000000000000000000', // 1 Token in Wei
  })
  value: string;

  @ApiProperty({
    description: 'The nonce of the owner at the time of signing.',
    example: '1',
  })
  nonce: number;

  @ApiProperty({
    description: 'The deadline (as a Unix timestamp) for the permit.',
    example: '1700000000',
  })
  deadline_timestamp: number;

  @ApiProperty({
    description: 'The deadline (as a Date object) for the permit.',
    example: '2022-12-31T23:59:59Z',
  })
  deadline_date: Date;

  @ApiProperty({
    description: 'The address of the contract to verify against.',
    example: '0xContractAddress1234567890abcdef1234567890abcdef',
  })
  verifying_contract: string;

  @ApiProperty({
    description: 'The EIP-712 signature being validated.',
    example:
      '0xSignature1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
  })
  signature: string;
}
