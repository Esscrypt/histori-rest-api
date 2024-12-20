import { ApiProperty } from '@nestjs/swagger';
import { NetworkChainResponseDto } from '../network-chainid.dto';

export class CheckComplianceResponseDto extends NetworkChainResponseDto {
  @ApiProperty({
    description: 'The address being checked.',
    example: '0xa24D38b1B49E32c1c63731810a8D42ec9dd9aa8C',
  })
  holder: string;

  @ApiProperty({
    description: 'The token address being checked.',
    example: '0xWhitelistAddress2',
  })
  token_address: string;

  @ApiProperty({
    description: 'Whether the address is in the list (true/false).',
    example: true,
  })
  status: boolean;
}
