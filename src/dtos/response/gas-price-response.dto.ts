import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GasPriceResponseDto {
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
    description: 'The block height (block number).',
    example: 20950751,
  })
  block_height: number;

  @ApiProperty({
    description:
      'The type of transaction (e.g., native_transfer, erc20_transfer, swap).',
    example: 'native_transfer',
  })
  event_type: string;

  @ApiProperty({
    description: 'The amount of gas required for the transaction.',
    example: '21000',
  })
  gas_required: string;

  @ApiProperty({
    description: 'The gas price in wei.',
    example: '13216708294',
  })
  gas_cost_wei: string;

  @ApiProperty({
    description: 'The gas price in gwei.',
    example: '13.216708294',
  })
  gas_cost_gwei: string;

  @ApiProperty({
    description: 'The gas price in ETH.',
    example: '0.000000013216708294',
  })
  gas_cost_eth: string;

  @ApiPropertyOptional({
    description: 'The fee cost in wei.',
    example: '26432216588',
  })
  fee_wei?: string;

  @ApiPropertyOptional({
    description: 'The fee cost in gwei.',
    example: '26.432216588',
  })
  fee_gwei?: string;

  @ApiPropertyOptional({
    description: 'The fee cost in ETH.',
    example: '0.000000026432216588',
  })
  fee_eth?: string;

  @ApiPropertyOptional({
    description: 'The tip cost in wei.',
    example: '1200000',
  })
  tip_wei?: string;

  @ApiPropertyOptional({
    description: 'The tip cost in gwei.',
    example: '0.0012',
  })
  tip_gwei?: string;

  @ApiPropertyOptional({
    description: 'The tip cost in ETH.',
    example: '0.0000000000012',
  })
  tip_eth?: string;

  @ApiPropertyOptional({
    description: 'The currency used (e.g., USD).',
    example: 'USD',
  })
  currency?: string;

  @ApiPropertyOptional({
    description:
      'The fee cost in traditional currency. This goes to the miner/proposer of the block for the network.',
    example: '$0.000207106596',
  })
  fee_cost?: string;

  @ApiPropertyOptional({
    description:
      'The tip cost in traditional currency. This is paid as priority fee to builders for faster transaction inclusions.',
    example: '$0.000000031662',
  })
  tip_cost?: string;

  @ApiPropertyOptional({
    description:
      'The cost for single compute unit (gas) in traditional currency.',
    example: '$0.000103569129',
  })
  gas_cost?: string;

  @ApiPropertyOptional({
    description:
      'The cost for the whole execution of the logic on the specified network in traditional currency.',
    example: '$2.174951709425',
  })
  execution_cost?: string;

  @ApiPropertyOptional({
    description: 'The total cost for execution in traditional currency.',
    example: '$2.175158847683',
  })
  total_cost?: string;
}
