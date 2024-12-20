// dto/contract-deployment-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class ContractDeploymentResponseDto {
  @ApiProperty({
    description: 'The blockchain network name',
    example: 'eth-mainnet',
  })
  network_name: string;

  @ApiProperty({
    description: 'The chain ID of the network.',
    example: 1,
  })
  chain_id: number;

  @ApiProperty({
    description: 'The contract address being checked',
    example: '0x1234567890123456789012345678901234567890',
  })
  contract_address: string;

  @ApiProperty({
    description: 'The deployment block number of the contract',
    example: 12345678,
    required: false,
  })
  block_number?: number;

  @ApiProperty({
    description: 'The deployment block hash of the contract',
    example:
      '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdef',
    required: false,
  })
  block_hash?: string;
}
