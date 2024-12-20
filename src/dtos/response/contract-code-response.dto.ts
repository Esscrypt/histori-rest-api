import { ApiProperty } from '@nestjs/swagger';
import { NetworkChainResponseDto } from '../network-chainid.dto';

export class ContractCodeResponseDto extends NetworkChainResponseDto {
  @ApiProperty({
    description: 'Address of the contract',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  contract_address: string;

  @ApiProperty({
    description: 'Bytecode of the contract deployed at the given address',
    example:
      '0x6080604052348015600f57600080fd5b506040516020806101238339810180604052810190808051...',
  })
  code: string;
}
