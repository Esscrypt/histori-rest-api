import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsOptional,
  IsNumber,
  Min,
  IsDateString,
  Validate,
  IsEthereumAddress,
} from 'class-validator';
import { EitherBlockHeightOrDateValidator } from 'src/validators/either-date-or-block-height.validator';

export class GetGasPriceRequestDto {
  @ApiPropertyOptional({
    description:
      'Type of transaction: native token transfer, ERC20 transfer, or swap.',
    enum: ['native_transfer', 'erc20_transfer', 'swap'],
    example: 'native_transfer',
  })
  @IsOptional()
  @IsIn(['native_transfer', 'erc20_transfer', 'swap'], {
    message:
      'Invalid request type. Must be one of native_transfer, erc20_transfer, swap',
  })
  type?: string;

  @ApiPropertyOptional({
    description: 'From address for the transaction',
  })
  @IsOptional()
  @IsEthereumAddress({ message: 'Invalid from address' })
  transaction_from?: string;

  @ApiPropertyOptional({
    description: 'To address for the transaction',
  })
  @IsOptional()
  @IsEthereumAddress({ message: 'Invalid to address' })
  transaction_to?: string;

  @ApiPropertyOptional({
    description: 'Amount to transfer',
  })
  @IsOptional()
  transaction_amount?: string;

  @ApiPropertyOptional({
    description: 'Transaction data',
  })
  @IsOptional()
  transaction_data?: string;

  @ApiPropertyOptional({
    description: 'RLP encoded transaction with hex prefix',
  })
  transaction?: string;

  @ApiPropertyOptional({
    description: 'Custom gas limit for the transaction',
    example: '100000',
  })
  @IsOptional()
  @IsNumber()
  gasLimit?: number;

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
