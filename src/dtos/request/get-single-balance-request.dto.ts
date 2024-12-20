import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEthereumAddress,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  IsDateString,
  Validate,
} from 'class-validator';
import { EitherBlockHeightOrDateValidator } from 'src/validators/either-date-or-block-height.validator';

export class GetSingleBalanceRequestDto {
  @ApiProperty({
    description: 'The wallet address or ENS name of the user.',
    example: 'vitalik.eth',
    required: true,
  })
  @IsNotEmpty()
  holder: string;

  @ApiProperty({
    description: 'The unique identifier (contract address) of the token.',
    example: '0xF2ec4a773ef90c58d98ea734c0eBDB538519b988',
    required: true,
  })
  @IsNotEmpty()
  @IsEthereumAddress({ message: 'Invalid Ethereum address.' })
  token_address: string;

  // Either blockNumber or timestamp must be provided, but not both
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
