import { ApiProperty } from '@nestjs/swagger';
import { IsEthereumAddress, IsNotEmpty, IsNumberString } from 'class-validator';

export class GetTokenUriRequestDto {
  @ApiProperty({
    description: 'The contract address of the ERC721 or ERC1155 token.',
    example: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
  })
  @IsNotEmpty()
  @IsEthereumAddress({ message: 'Invalid Ethereum address.' })
  tokenAddress: string;

  @ApiProperty({
    description: 'The token ID for which the token URI is requested.',
    example: '1',
  })
  @IsNotEmpty()
  @IsNumberString({}, { message: 'Token ID must be a numeric string.' })
  tokenId: string;
}
