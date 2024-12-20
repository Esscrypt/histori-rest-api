import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AllowanceDto {
  @ApiProperty({
    description: 'The contract address of the token in hexadecimal format.',
    example: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  })
  contractAddress: string;

  @ApiProperty({
    description: 'The ENS name or address of the owner.',
    example: 'vitalik.eth',
  })
  owner: string;

  @ApiProperty({
    description: 'The ENS name or address of the spender.',
    example: 'vitalik.eth',
  })
  spender: string;

  @ApiPropertyOptional({
    description:
      'The allowance amount. Optional for ERC721 and ERC1155 tokens, which do not have a specific allowance value.',
    example: '1000000000000000000',
  })
  allowance: string;

  @ApiProperty({
    description: 'The block number for which the allowance is requested.',
    example: 12345678,
  })
  blockNumber: number;

  @ApiProperty({
    description: 'The type of token: erc20, erc721, erc777, or erc1155.',
    example: 'erc20',
  })
  tokenType: string;
}
