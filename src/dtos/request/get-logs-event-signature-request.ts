import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEthereumAddress, IsNumber, Min } from 'class-validator';
import { IsHash } from 'src/validators/hash.validator';

export class GetLogsEventSignatureRequestDto {
  @ApiProperty({
    description: 'The starting block number.',
    example: 123456,
    required: true,
  })
  @IsNumber()
  @Min(1)
  start_block?: number;

  @ApiPropertyOptional({
    description:
      'The ending block number. Must be greater than startBlock and not more than 2000 blocks further.',
    example: 123999,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  end_block?: number;

  @ApiPropertyOptional({
    description: 'The block hash to filter logs.',
    example:
      '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  })
  @IsOptional()
  @IsHash()
  block_hash?: string;

  @ApiProperty({
    description: 'Event signature to filter logs',
    example: 'Transfer(address,address,uint256)',
  })
  event_signature: string;

  @ApiPropertyOptional({
    description: 'The contract address to filter logs.',
    example: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
  })
  @IsOptional()
  @IsEthereumAddress()
  contract_address?: string;
}
