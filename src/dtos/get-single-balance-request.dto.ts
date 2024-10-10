import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEthereumAddress,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  IsDateString,
  ValidateIf,
} from 'class-validator';

export class GetSingleBalanceRequestDto {
  @ApiPropertyOptional({
    description: 'The wallet address or ENS name of the user.',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  @IsNotEmpty()
  holder: string;

  @ApiPropertyOptional({
    description: 'The contract address of the token.',
    example: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
  })
  @IsNotEmpty()
  @IsEthereumAddress({ message: 'Invalid Ethereum address.' })
  tokenAddress: string;

  // Either blockNumber or timestamp must be provided, but not both
  @ApiPropertyOptional({
    description: 'Optional block number for which the balance is requested.',
    example: '123456',
  })
  @IsOptional()
  @ValidateIf((o) => !o.timestamp)
  @IsNumber()
  @Min(0)
  blockNumber?: number;

  @ApiPropertyOptional({
    description:
      'Optional timestamp for which the balance is requested (ISO 8601 format).',
    example: '2022-01-01T00:00:00Z',
  })
  @IsOptional()
  @ValidateIf((o) => !o.blockNumber)
  @IsDateString()
  timestamp?: string;
}
