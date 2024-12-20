import { ApiProperty } from '@nestjs/swagger';

export class NetworkChainResponseDto {
  @ApiProperty({
    description: 'Name of the blockchain network',
    example: 'eth-mainnet',
  })
  network: string;

  @ApiProperty({
    description: 'Chain ID of the blockchain network',
    example: 1,
  })
  chain_id: number;
}
