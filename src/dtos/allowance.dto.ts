import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AllowanceDto {
  @ApiProperty({
    description: 'The contract address of the token in hexadecimal format.',
  })
  contractAddress: string;

  @ApiProperty({ description: 'The ENS name or address of the owner.' })
  owner: string;

  @ApiProperty({ description: 'The ENS name or address of the spender.' })
  spender: string;

  @ApiPropertyOptional({
    description:
      'The allowance amount. Optional for ERC721 and ERC1155 tokens, which do not have a specific allowance value.',
  })
  allowance?: string;

  @ApiProperty({
    description: 'The block number for which the allowance is requested.',
  })
  blockNumber: number;

  @ApiProperty({
    description: 'The type of token: erc20, erc721, erc777, or erc1155.',
  })
  tokenType: string;

  @ApiPropertyOptional({
    description:
      'The token ID, used for non-fungible tokens like ERC721 and ERC1155. Optional.',
  })
  tokenId?: string;
}
