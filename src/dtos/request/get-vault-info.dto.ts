import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEthereumAddress } from 'class-validator';

export class GetVaultInfoDto {
  @ApiProperty({
    description: 'The address of the ERC-4626 token vault.',
    example: '0x111111111117dc0aa78b770fa6a738034120c302',
  })
  @IsEthereumAddress({ message: 'Invalid vault address.' })
  @IsString()
  @IsNotEmpty()
  vault_address: string;
}
