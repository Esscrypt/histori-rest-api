import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEthereumAddress,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  Validate,
} from 'class-validator';
import { EitherBlockHeightOrDateValidator } from 'src/validators/either-date-or-block-height.validator';

export class GetTokenSupplyRequestDto {
  @ApiProperty({
    description: 'The contract address of the token or ENS name.',
    example: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    required: true,
  })
  @IsNotEmpty()
  @IsEthereumAddress({
    message: 'it must be a valid address.',
  })
  token_address: string;

  @ApiPropertyOptional({
    description:
      'Optional block number for which the balance is requested. Provide only block height or timestamp you want to check for.',
    example: '21021201',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  block_height?: number;

  @ApiPropertyOptional({
    description:
      'Optional Date timestamp for which the balance is requested (ISO 8601 format). Provide only block height or timestamp you want to check for.',
    example: '2024-10-22T12:10:47.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  date?: string;

  // Apply the custom validator to the class
  @Validate(EitherBlockHeightOrDateValidator)
  either: any;
}
