import { ApiProperty } from '@nestjs/swagger';
import { IsEthereumAddress, IsNotEmpty, IsNumberString } from 'class-validator';

export class GetBalanceRequestDto {
  @ApiProperty({
    description: 'The wallet address or ENS name of the user.',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  @IsNotEmpty()
  walletAddress: string;

  @ApiProperty({
    description: 'The contract address of the token.',
    example: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
  })
  @IsNotEmpty()
  @IsEthereumAddress({ message: 'Invalid Ethereum address.' })
  tokenAddress: string;

  @ApiProperty({
    description: 'The block number for which the balance is requested.',
    example: '123456',
  })
  @IsNotEmpty()
  @IsNumberString({}, { message: 'Block number must be a numeric string.' })
  blockNumber: string;
}
