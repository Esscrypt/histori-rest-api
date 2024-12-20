import { ApiProperty } from '@nestjs/swagger';
import { NetworkChainResponseDto } from '../network-chainid.dto';

export class ContractStorageResponseDto extends NetworkChainResponseDto {
  @ApiProperty({
    description: 'Address of the contract',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  contract_address: string;

  @ApiProperty({
    description: 'Storage position queried',
    example: '0',
  })
  position: string;

  @ApiProperty({
    description: 'Value stored at the given position',
    example:
      '0x0000000000000000000000000000000000000000000000000000000000000001',
  })
  storage_value: string;
}
