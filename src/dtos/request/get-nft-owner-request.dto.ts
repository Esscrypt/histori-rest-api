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

export class GetNFTOwnerRequestDto {
  @ApiProperty({
    description: 'The contract address of the ERC721 or ERC1155 token.',
    example: '0xB3e782D5919924Faa456B5b5689B0A45963da4b7',
    required: true,
  })
  @IsNotEmpty()
  @IsEthereumAddress({ message: 'Invalid Ethereum address.' })
  token_address: string;

  @ApiProperty({
    description: 'The ENS name or address of the owner.',
    example: '0xd5470BaFb6074B10107b303D0cCe03cA5539b6E3',
    required: true,
  })
  @IsNotEmpty()
  owner: string;

  @ApiProperty({
    description: 'The token ID for which the token URI is requested.',
    example: '1',
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  token_id: number;

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
