import { ApiProperty } from '@nestjs/swagger';
import { IsEthereumAddress, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class GetTokenUriRequestDto {
  @ApiProperty({
    description: 'The contract address of the ERC721 or ERC1155 token.',
    example: '0x630aa263CD2D9afed696AC6ca76268AFcD0ab1b2',
    required: true,
  })
  @IsNotEmpty()
  @IsEthereumAddress({ message: 'Invalid Ethereum address.' })
  token_address: string;

  @ApiProperty({
    description: 'The token ID for which the token URI is requested.',
    example: '1',
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  token_id: number;
}
