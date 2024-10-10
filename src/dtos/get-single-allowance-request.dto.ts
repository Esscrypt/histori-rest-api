import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEthereumAddress,
  IsNotEmpty,
  IsOptional,
  IsNumberString,
  IsNumber,
  ValidateIf,
} from 'class-validator';

export class GetSingleAllowanceRequestDto {
  @ApiPropertyOptional({
    description: 'The wallet address or ENS name of the owner.',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  @IsNotEmpty()
  owner: string;

  @ApiPropertyOptional({
    description: 'The wallet address or ENS name of the spender.',
    example: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
  })
  @IsNotEmpty()
  spender: string;

  @ApiPropertyOptional({
    description: 'The contract address of the token.',
    example: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
  })
  @IsNotEmpty()
  @IsEthereumAddress({ message: 'Invalid Ethereum address.' })
  tokenAddress: string;

  @ApiPropertyOptional({
    description: 'The block number for which the allowance is requested.',
    example: '123456',
  })
  @IsOptional()
  @ValidateIf((o) => !o.timestamp) // Only validate if `period` is not provided
  @IsNumber()
  blockNumber?: number;

  @ApiPropertyOptional({
    description:
      'The timestamp for which the allowance is requested (ISO 8601 format).',
    example: '2022-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsNumberString()
  timestamp?: string;
}
