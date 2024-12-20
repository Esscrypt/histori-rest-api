import { ApiProperty } from '@nestjs/swagger';
import { IsEthereumAddress } from 'class-validator';

export class GetTokenByAddressDto {
  @ApiProperty({
    description:
      'The unique identifier (contract address) of the token in hexadecimal format.',
    example: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  })
  @IsEthereumAddress({
    message: 'it must be a valid address.',
  })
  token_address: string;
}
