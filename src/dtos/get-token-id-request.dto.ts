import { ApiProperty } from '@nestjs/swagger';
import { IsEthereumAddress, IsNotEmpty, IsNumberString } from 'class-validator';

export class GetTokenIDRequestDto {
  @ApiProperty({
    description: 'The contract address of the token or ENS name.',
    example: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
  })
  @IsNotEmpty()
  @IsEthereumAddress({ message: 'Invalid Ethereum address.' })
  contractAddress: string;

  @ApiProperty({
    description: 'The token ID for the ERC721 or ERC1155 token.',
    example: '1',
  })
  @IsNotEmpty()
  @IsNumberString({}, { message: 'Token ID must be a numeric string.' })
  tokenId: string;
}
