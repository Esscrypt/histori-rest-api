import { ApiProperty } from '@nestjs/swagger';
import { BlockHeightOrDateDto } from '../block-height-or-date.dto';

export class GetContractCodeDto extends BlockHeightOrDateDto {
  @ApiProperty({
    description: 'Address of the contract',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  contract_address: string;
}
