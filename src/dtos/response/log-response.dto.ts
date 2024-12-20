import { ApiProperty } from '@nestjs/swagger';

export class LogDto {
  @ApiProperty({
    description: 'The address of the contract that emitted the event.',
    example: '0x6b175474e89094c44da98b954eedeac495271d0f',
  })
  address: string;

  @ApiProperty({
    description:
      'The topics of the log entry, typically an event signature and indexed parameters.',
  })
  topics: readonly string[];

  @ApiProperty({
    description:
      'The data of the log entry, typically non-indexed event parameters.',
  })
  data: string;

  @ApiProperty({ description: 'The block number where this log was included.' })
  block_height: number;

  @ApiProperty({ description: 'The block hash where this log was included.' })
  block_hash: string;

  @ApiProperty({ description: 'The index position of this log in the block.' })
  log_index: number;

  @ApiProperty({
    description:
      'The transaction hash of the transaction that emitted the event.',
  })
  transaction_hash: string;

  @ApiProperty({
    description: 'The index position of the event log within the transaction.',
  })
  transaction_index: number;

  @ApiProperty({
    description: 'Whether the event was removed due to a chain reorganization.',
  })
  removed: boolean;
}

export class LogResponseDto {
  @ApiProperty({
    description: 'Blockchain network name For the requested query',
    example: 'eth-mainnet',
  })
  network_name: string;

  @ApiProperty({
    description: 'The chain ID of the network.',
    example: 1,
  })
  chain_id: number;

  @ApiProperty({
    description: 'The total number of logs returned.',
    example: 1,
  })
  count: number;

  @ApiProperty({
    description: 'The logs returned by the query.',
    type: LogDto,
    isArray: true,
  })
  logs: LogDto[];
}
