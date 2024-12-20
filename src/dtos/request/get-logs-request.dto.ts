import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsEthereumAddress,
  IsString,
  IsArray,
  IsNumber,
  Min,
  Matches,
} from 'class-validator';
import { IsHash } from 'src/validators/hash.validator';

export class GetLogsRequestDto {
  @ApiPropertyOptional({
    description: 'The starting block number.',
    example: 123456,
    required: true,
  })
  @IsNumber()
  @Min(1)
  start_block?: number;

  @ApiPropertyOptional({
    description:
      'The ending block number. Must be greater than startBlock and not more than 2000 blocks further.',
    example: 123999,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  end_block?: number;

  @ApiPropertyOptional({
    description: 'The block hash to filter logs.',
    example:
      '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  })
  @IsOptional()
  @IsHash()
  block_hash?: string;

  @ApiPropertyOptional({
    description: 'The contract address to filter logs.',
    example: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
  })
  @IsOptional()
  @IsEthereumAddress()
  contract_address?: string;

  @ApiPropertyOptional({
    description: 'The topics array to filter logs.',
    example: [
      '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    ],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Matches(/^0x[a-fA-F0-9]{64}$/, {
    each: true,
    message: 'Each topic must be a valid Keccak256 hash',
  }) // Validate each topic as a Keccak256 hash
  topics?: string[];
}
