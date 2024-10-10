import { ApiProperty } from '@nestjs/swagger';
import { IsEthereumAddress, IsNotEmpty, IsNumber } from 'class-validator';

export class GetNFTOwnerRequestDto {
  @ApiProperty({
    description: 'The contract address of the ERC721 or ERC1155 token.',
    example: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
  })
  @IsNotEmpty()
  @IsEthereumAddress({ message: 'Invalid Ethereum address.' })
  tokenAddress: string;

  @ApiProperty({ description: 'The ENS name or address of the owner.' })
  @IsNotEmpty()
  owner: string;

  @ApiProperty({
    description: 'The token ID for which the token URI is requested.',
    example: '1',
  })
  @IsNotEmpty()
  @IsNumber()
  tokenId: string;
}
