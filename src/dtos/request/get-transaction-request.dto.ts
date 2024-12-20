import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsHash } from 'src/validators/hash.validator';

export class GetTransactionRequestDto {
  @ApiProperty({
    description:
      'The unique idendifier of the transaction (transaction hash). Must be a 32 byte hex string starting with 0x',
    example:
      '0xf85e0f37296608a3a23ffd8b2349c4cb25e9174d357c32d4416d3eb1d214080e',
    required: true,
  })
  @IsHash({ message: 'Invalid Ethereum transaction hash.' })
  tx_hash: string;

  @ApiPropertyOptional({
    description: 'The currency used for the conversion.',
    example: 'USD',
    required: false,
  })
  currency?: string;
}
