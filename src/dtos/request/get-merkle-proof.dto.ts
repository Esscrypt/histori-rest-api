import { ApiProperty } from '@nestjs/swagger';
import { BlockHeightOrDateDto } from '../block-height-or-date.dto';
// import { IsArray } from 'class-validator';

export class GetMerkleProofDto extends BlockHeightOrDateDto {
  @ApiProperty({
    description: 'Address of the contract',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  contract_address: string;

  @ApiProperty({
    description:
      'An array of storage-keys that should be proofed and included.',
    example: ['0x0', '0x1'],
    type: [String],
    required: true,
  })
  // @IsArray()
  storage_keys: string;
}
