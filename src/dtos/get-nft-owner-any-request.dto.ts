import { ApiProperty } from '@nestjs/swagger';
import { IsEthereumAddress, IsNotEmpty } from 'class-validator';

export class GetNFTOwnerAnyRequestDto {
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
}
