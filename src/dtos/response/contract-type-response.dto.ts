// dto/contract-type-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class ContractTypeResponseDto {
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
    example: '0x6b175474e89094c44da98b954eedeac495271d0f',
  })
  token_address: string;

  @ApiProperty({
    description:
      'The ERC standard being checked (erc20, erc721, erc1155, erc777)',
    example: 'erc20',
  })
  type_checked: string;

  @ApiProperty({
    description: 'Whether the contract implements the specified ERC standard',
    example: true,
  })
  is_of_type: boolean;
}
