import { ApiProperty } from '@nestjs/swagger';
import { TokenDto } from '../token.dto';

export class VaultInfoResponseDto {
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
    description: 'The address of the ERC-4626 token vault.',
    example: '0x111111111117dc0aa78b770fa6a738034120c302',
  })
  vault_address: string;

  @ApiProperty({
    description: 'The name of the vault.',
    example: 'Compound Vault',
  })
  name: string;

  @ApiProperty({ description: 'The symbol of the vault.', example: 'cVault' })
  symbol: string;

  @ApiProperty({
    description: 'The total assets managed by the vault.',
    example: '1000000',
  })
  total_assets: string;

  @ApiProperty({
    description:
      'The total assets managed by the vault, denominated in ETH. (10^18)',
    example: '1000000',
  })
  total_assets_eth: string;

  @ApiProperty({
    description: 'The total shares issued by the vault.',
    example: '500000',
  })
  total_shares: string;

  @ApiProperty({
    description:
      'The total shares issued by the vault, denominated in ETH. (10^18)',
    example: '250000',
  })
  total_shares_eth: string;

  @ApiProperty({
    description: 'The exchange rate between shares and assets.',
    example: '2',
  })
  exchange_rate: string;

  @ApiProperty({
    description: 'The underlying asset of the vault.',
    type: TokenDto,
  })
  underlying_asset: TokenDto;
}
