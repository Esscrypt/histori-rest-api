import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class NFTDto {
  @ApiProperty({
    description: 'The token ID for the specific NFT.',
    example: 2,
  })
  token_id: number;

  @ApiProperty({
    description: 'The URI of the NFT, which can be an HTTP or IPFS URL.',
    example:
      'https://ipfs.io/ipfs/QmXUpbiHn8R42REihF5K8iEdi5yq6Xg81nVTfETLfCfK6k/metadata.json',
  })
  token_uri: string;

  @ApiPropertyOptional({
    description:
      'The metadata of the token, which can include images, attributes, and other data.',
    type: Object,
    example: {
      name: 'peace',
      description: 'peace',
      image:
        'https://ipfs.io/ipfs/Qmdw9iDyhb4V5njWgvPcCb71sdws2TZh77jEhqZn2TTiNE/nft.jpg',
    },
  })
  metadata?: any; // Represents the JSON object containing the token's metadata.

  @ApiProperty({
    description: 'The address of the owner of the NFT.',
    example: '0x6b175474e89094c44da98b954eedeac495271d0f',
  })
  owner: string;

  @ApiProperty({
    description: 'The address of the contract that issued the NFT.',
    example: '0x6b175474e89094c44da98b954eedeac495271d0f',
  })
  token_address: string;

  // This was the creation block of the contract itself, not of the mint event for the specific NFT. This is misleading
  // @ApiProperty({
  //   description: 'Block number at the time of token creation',
  //   example: 123456,
  // })
  // block_height: number;

  @ApiProperty({
    description: 'The name of the NFT.',
    example: 'CryptoKitties',
  })
  name: string;

  @ApiProperty({
    description: 'The symbol of the NFT.',
    example: 'RARI',
  })
  symbol: string;
}
