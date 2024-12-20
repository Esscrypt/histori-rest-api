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

export class GetSingleAllowanceRequestDto {
  @ApiProperty({
    description: 'The wallet address or ENS name of the owner.',
    example: '0xa24D38b1B49E32c1c63731810a8D42ec9dd9aa8C',
    required: true,
  })
  @IsNotEmpty()
  owner: string;

  @ApiProperty({
    description: 'The wallet address or ENS name of the spender.',
    example: '0x858646372CC42E1A627fcE94aa7A7033e7CF075A',
    required: true,
  })
  @IsNotEmpty()
  spender: string;

  @ApiProperty({
    description: 'The contract address of the token.',
    example: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
    required: true,
  })
  @IsNotEmpty()
  @IsEthereumAddress({ message: 'Invalid Ethereum address.' })
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
