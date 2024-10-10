import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEthereumAddress,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
  IsNumber,
  Min,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

class PeriodDto {
  @ApiProperty({
    description: 'Start of the block range or timestamp (ISO 8601).',
    example: '2022-01-01T00:00:00Z',
  })
  @IsNotEmpty()
  @IsDateString()
  start: string;

  @ApiProperty({
    description: 'End of the block range or timestamp (ISO 8601).',
    example: '2022-01-02T00:00:00Z',
  })
  @IsNotEmpty()
  @IsDateString()
  end: string;
}

export class GetRangeBalanceRequestDto {
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

  @ApiPropertyOptional({
    description: 'Period for querying balances over time.',
  })
  @ValidateNested()
  @IsOptional()
  @Type(() => PeriodDto)
  period?: PeriodDto;

  @ApiPropertyOptional({
    description: 'Start block number for querying balances over time.',
    example: 123456,
  })
  @IsOptional()
  @ValidateIf((o) => !o.period) // Only validate if `period` is not provided
  @IsNumber()
  @Min(0)
  startBlock?: number;

  @ApiPropertyOptional({
    description: 'End block number for querying balances over time.',
    example: 123999,
  })
  @IsOptional()
  @ValidateIf((o) => !o.period) // Only validate if `period` is not provided
  @IsNumber()
  @Min(0)
  endBlock?: number;
}
