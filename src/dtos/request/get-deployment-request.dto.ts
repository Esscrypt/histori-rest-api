import { ApiProperty } from '@nestjs/swagger';
import { IsEthereumAddress, IsNotEmpty } from 'class-validator';

export class GetDeploymentRequestDto {
  @ApiProperty({
    description: 'The contract address of the token.',
    example: '0xF2ec4a773ef90c58d98ea734c0eBDB538519b988',
    required: true,
  })
  @IsNotEmpty()
  @IsEthereumAddress({ message: 'Invalid Ethereum address.' })
  contract_address: string;
}
