import { ApiProperty } from '@nestjs/swagger';
import { TransactionDetailsDto } from '../transaction-details.dto';

export class TransactionResponseDto {
  @ApiProperty({
    description: 'The blockchain network name (e.g., eth-mainnet).',
    example: 'eth-mainnet',
  })
  network_name: string;

  @ApiProperty({
    description:
      'The ID of the blockchain network (e.g., Ethereum mainnet is 1).',
    example: 1,
  })
  chain_id: number;

  @ApiProperty({
    description: 'The transaction details.',
    type: TransactionDetailsDto,
  })
  transaction: TransactionDetailsDto;
}
