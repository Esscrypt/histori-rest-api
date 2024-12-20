import { ApiProperty } from '@nestjs/swagger';
import { BlockDto } from '../block.dto';

export class BlockResponseDto {
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
    description: 'The block information for the requested query',
    type: BlockDto,
  })
  block: BlockDto;
}
