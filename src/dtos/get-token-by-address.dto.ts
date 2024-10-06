import { ApiProperty } from '@nestjs/swagger';
import { IsEthereumAddress } from 'class-validator';

export class GetTokenByAddressDto {
  @ApiProperty({
    description:
      'The contract address of the token in hexadecimal format or an ENS name.',
    example: '0xCeD4E93198734dDaFf8492d525Bd258D49eb388E',
  })
  @IsEthereumAddress({
    message: 'it must be a valid address.',
  })
  contractAddress: string;
}
