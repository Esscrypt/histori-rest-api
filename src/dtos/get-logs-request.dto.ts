import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsEthereumAddress,
  IsString,
  IsArray,
  IsNumber,
} from 'class-validator';

export class GetLogsRequestDto {
  @ApiPropertyOptional({
    description: 'The starting block number.',
    example: 123456,
  })
  @IsOptional()
  @IsNumber()
  startBlock?: number;

  @ApiPropertyOptional({
    description: 'The ending block number.',
    example: 123999,
  })
  @IsOptional()
  @IsNumber()
  endBlock?: number;

  @ApiPropertyOptional({
    description: 'The block hash to filter logs.',
    example:
      '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  })
  @IsOptional()
  @IsString()
  blockHash?: string;

  @ApiPropertyOptional({
    description: 'The contract address to filter logs.',
    example: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
  })
  @IsOptional()
  @IsEthereumAddress()
  contractAddress?: string;

  @ApiPropertyOptional({
    description: 'The topics array to filter logs.',
    example: [
      '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    ],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  topics?: string[];
}
