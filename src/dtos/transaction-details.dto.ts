import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LogEventDto } from './log-event.dto';

export class TransactionDetailsDto {
  @ApiProperty({
    description: 'The ISO timestamp when the block was signed.',
    example: '2024-10-22T15:04:23.000Z',
  })
  block_signed_at: string;

  @ApiProperty({
    description: 'The height (number) of the block.',
    example: 21021896,
  })
  block_height: number;

  @ApiProperty({
    description: 'The hash of the block that contains the transaction.',
    example:
      '0x064ea929af4b3a7077cefc68d0ced4f6ed59575581cc48effab64ac5feef1ce0',
  })
  block_hash: string;

  @ApiProperty({
    description:
      'The transaction hash (unique identifier for the transaction).',
    example:
      '0xf85e0f37296608a3a23ffd8b2349c4cb25e9174d357c32d4416d3eb1d214080e',
  })
  tx_hash: string;

  @ApiProperty({
    description: 'The index of the transaction within the block.',
    example: 144,
  })
  tx_index: number;

  @ApiProperty({
    description:
      'Indicates whether the transaction was successful (true/false).',
    example: true,
  })
  successful: boolean;

  @ApiProperty({
    description: 'The address that initiated the transaction.',
    example: '0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5',
  })
  from: string;

  @ApiProperty({
    description:
      'The address of the miner who mined the block (optional field).',
    example: '0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5',
    required: false,
  })
  miner?: string;

  @ApiProperty({
    description:
      'The recipient address of the transaction. It can be null for contract creation transactions.',
    example: '0x4675C7e5BaAFBFFbca748158bEcBA61ef3b0a263',
    nullable: true,
  })
  to: string | null;

  @ApiProperty({
    description:
      'The value transferred in the transaction, denominated in Ether.',
    example: '0.064970294810854029',
  })
  value: string;

  @ApiProperty({
    description: 'The amount of gas offered by the sender for the transaction.',
    example: '21000',
  })
  gas_offered: string;

  @ApiProperty({
    description: 'The amount of gas actually spent in the transaction.',
    example: '21000',
  })
  gas_spent: string;

  @ApiProperty({
    description: 'The price of gas for the transaction, denominated in gwei.',
    example: '13.499486147',
  })
  gas_price: string;

  @ApiProperty({
    description: 'The total transaction fees paid, denominated in Ether.',
    example: '0.000283489209087',
  })
  fees_paid: string;

  @ApiProperty({
    description:
      'The raw transaction data in hexadecimal format (optional field).',
    example:
      '0xf86a808504a817c800830f4240944675c7e5baafbffca748158becba61ef3b0a26380b844a9059cbb0000000000000000000000004675c7e5baafbffca748158becba61ef3b0a263',
  })
  transaction_raw: string;

  @ApiProperty({
    description:
      'The input data sent with the transaction, typically used for contract interactions.',
    example: '0x',
  })
  input_data: string;

  @ApiPropertyOptional({
    description: 'The list of log events emitted during the transaction.',
    type: [LogEventDto],
  })
  log_events?: LogEventDto[];

  @ApiPropertyOptional({
    description:
      'A URL to view the transaction on a block explorer (e.g., Etherscan).',
    example:
      'https://etherscan.io/tx/0xf85e0f37296608a3a23ffd8b2349c4cb25e9174d357c32d4416d3eb1d214080e',
  })
  explorer_url?: string;

  @ApiPropertyOptional({
    description: 'The transaction cost in traditional currency (e.g., USD).',
    example: '$0.3',
    required: false,
  })
  transaction_cost?: string;
}
