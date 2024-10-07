import { ApiProperty } from '@nestjs/swagger';
import { IsEthereumAddress, IsNotEmpty, IsNumberString } from 'class-validator';

export class GetTokenSupplyRequestDto {
  @ApiProperty({
    description: 'The contract address of the token or ENS name.',
    example: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
  })
  @IsNotEmpty()
  @IsEthereumAddress({
    message: 'it must be a valid address.',
  })
  tokenAddress: string;

  @ApiProperty({
    description: 'The block number for which the token supply is requested.',
    example: '123456',
  })
  @IsNotEmpty()
  @IsNumberString({}, { message: 'Block number must be a numeric string.' })
  blockNumber: string;
}
