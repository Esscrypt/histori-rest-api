import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsArray,
  IsNumber,
  Min,
  Matches,
} from 'class-validator';
import { IsHash } from 'src/validators/hash.validator';

export class GetLogsNoContractRequestDto {
  @ApiProperty({
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
      '0x0f0326eb0aa0faab45ebe820f4b942cbb5e47269d43825b75dc8089c44732b18',
  })
  @IsOptional()
  @IsHash()
  block_hash?: string;

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
function ApiProperty(arg0: { description: string; example: number; required: boolean; }): (target: GetLogsNoContractRequestDto, propertyKey: "start_block") => void {
  throw new Error('Function not implemented.');
}

