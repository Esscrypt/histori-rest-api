import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEthereumAddress,
  IsNotEmpty,
  ValidateNested,
  IsOptional,
  IsNumber,
  Min,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

class PeriodDto {
  @ApiPropertyOptional({
    description: 'Start of the block range or timestamp (ISO 8601).',
    example: '2022-01-01T00:00:00Z',
  })
  @IsNotEmpty()
  start: string;

  @ApiPropertyOptional({
    description: 'End of the block range or timestamp (ISO 8601).',
    example: '2022-01-02T00:00:00Z',
  })
  @IsNotEmpty()
  end: string;
}

export class GetRangeAllowanceRequestDto {
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
    description: 'Period for querying allowances over time.',
  })
  @ValidateNested()
  @IsOptional()
  @ValidateIf((o) => !o.startBlock && !o.endBlock)
  @Type(() => PeriodDto)
  period?: PeriodDto;

  @ApiPropertyOptional({
    description: 'Start block number for querying allowances over time.',
    example: 123456,
  })
  @IsOptional()
  @ValidateIf((o) => !o.period)
  @IsNumber()
  @Min(0)
  startBlock?: number;

  @ApiPropertyOptional({
    description: 'End block number for querying allowances over time.',
    example: 123999,
  })
  @IsOptional()
  @ValidateIf((o) => !o.period)
  @IsNumber()
  @Min(0)
  endBlock?: number;
}
