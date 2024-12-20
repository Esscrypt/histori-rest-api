import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsNumber,
  IsDateString,
  Validate,
} from 'class-validator';
import { IsHash } from 'src/validators/hash.validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { EitherBlockHashBlockHeightOrDateValidator } from 'src/validators/either-blockhash-date-or-block-height.validator copy';

export class GetBlockTransactionsRequestDto {
  // Either blockNumber or timestamp must be provided, but not both
  @ApiPropertyOptional({
    description:
      'Optional block number for which the transactions are requested. Provide only block height, timestamp or block hash you want to check for.',
    example: '21021201',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  block_height?: number;

  @ApiPropertyOptional({
    description:
      'Optional Date timestamp for which the balance is requested (ISO 8601 format). Provide only block height, timestamp or block hash you want to check for.',
    example: '2024-10-22T12:10:47.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({
    description: 'The block hash for which the block data is requested.',
    example:
      '0xd4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3',
    required: false,
  })
  @IsOptional()
  @IsHash()
  block_hash?: string;

  // Apply the custom validator to the class
  @Validate(EitherBlockHashBlockHeightOrDateValidator)
  either: any;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Number of transactions per page, Max 10 per page',
    example: 10,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  limit?: number;

  @ApiPropertyOptional({
    description: 'The currency used for the conversion.',
    example: 'USD',
    required: false,
  })
  currency?: string;
}
