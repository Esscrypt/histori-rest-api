import { ApiProperty } from '@nestjs/swagger';

export class LogEventDto {
  @ApiProperty({
    description: 'The index of the log event within the transaction.',
    example: 1,
  })
  log_index: number;

  @ApiProperty({
    description: 'The list of topics (event signatures) in the log event.',
    example: [
      '0xddf252ad',
      '0x000000000000000000000000abcd1234',
      '0x000000000000000000000000ef567890',
    ],
  })
  raw_log_topics: readonly string[];

  @ApiProperty({
    description: 'The address of the contract that emitted the log event.',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  sender_address: string;

  @ApiProperty({
    description: 'The raw data contained in the log event.',
    example: '0xabcdef...',
  })
  raw_log_data: string;
}
