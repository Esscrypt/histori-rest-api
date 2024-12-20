import { ApiProperty } from '@nestjs/swagger';
import { IsEthereumAddress, IsIn, IsNotEmpty } from 'class-validator';

export class GetContractTypeRequestDto {
  @ApiProperty({
    description: 'The contract address of the token.',
    example: '0xF2ec4a773ef90c58d98ea734c0eBDB538519b988',
    required: true,
  })
  @IsNotEmpty()
  @IsEthereumAddress({ message: 'Invalid Ethereum address.' })
  token_address: string;

  @ApiProperty({
    description: 'Check for token type (erc20, erc721, erc777, erc1155)',
    enum: ['erc20', 'erc721', 'erc777', 'erc1155'],
    example: 'erc20',
    required: true,
  })
  @IsIn(['erc20', 'erc721', 'erc777', 'erc1155'], {
    message:
      'Invalid token type. Must be one of erc20, erc721, erc777, erc1155',
  })
  token_type: string;
}
