import { ApiProperty } from '@nestjs/swagger';

export class PermitResponseDto {
  @ApiProperty({
    description: 'Blockchain network name For the requested query',
    example: 'eth-mainnet',
  })
  network_name: string;

  @ApiProperty({
    description: 'The chain ID of the network.',
    example: 1,
  })
  chain_id: number;

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
    description: 'The amount of tokens permitted (in token units).',
    example: '1000000000000000000',
  })
  value: string;

  @ApiProperty({
    description: 'The nonce of the owner at the time of signing.',
    example: '1',
  })
  nonce: string;

  @ApiProperty({
    description: 'The deadline for the permit (as a timestamp).',
    example: 1699999999,
  })
  deadline: number;

  @ApiProperty({
    description: 'The contract address of the ERC20 token.',
    example: '0x6b175474e89094c44da98b954eedeac495271d0f',
  })
  verifying_contract: string;

  @ApiProperty({
    description: 'The name of the token.',
    example: 'DAI',
  })
  tokenName: string;
  //TODO: perhaps return the whole token object here?

  @ApiProperty({
    description: 'The EIP-712 permit signature.',
    example: '0x...',
  })
  signature: string;
}
