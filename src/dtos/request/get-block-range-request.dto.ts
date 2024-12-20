import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  Min,
  IsOptional,
  IsDateString,
  Validate,
  IsInt,
  Max,
} from 'class-validator';
import { EitherBlockHeightOrDateValidator } from 'src/validators/either-date-or-block-height.validator';

export class GetBlockRangeRequestDto {
  // Either blockNumber or timestamp must be provided, but not both
  @ApiPropertyOptional({
    description:
      'Start Block number for which the balance is requested. Provide only block height or timestamp you want to check for.',
    example: '21021101',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  start_block_height?: number;

  @ApiPropertyOptional({
    description:
      'End Block number for which the balance is requested. Provide only block height or timestamp you want to check for.',
    example: '21021201',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  end_block_height?: number;

  @ApiPropertyOptional({
    description:
      'Start Date timestamp for which the balance is requested (ISO 8601 format). Provide only start block height or timestamp you want to check for.',
    example: '2024-10-22T12:10:47.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiPropertyOptional({
    description:
      'End Date timestamp for which the balance is requested (ISO 8601 format). Provide only block height or timestamp you want to check for.',
    example: '2024-10-23T12:10:47.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  end_date?: string;

  // Apply the custom validator to the class
  @Validate(EitherBlockHeightOrDateValidator)
  start_either: any;

  // Apply the custom validator to the class
  @Validate(EitherBlockHeightOrDateValidator)
  end_either: any;

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
    description: 'Number of blocks per page, Max 10 per page',
    example: 5,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  limit?: number;

  @ApiPropertyOptional({
    description:
      'The currency in which the block valuation conversion is requested.',
    example: 'USD',
    required: false,
  })
  currency?: string;
}
