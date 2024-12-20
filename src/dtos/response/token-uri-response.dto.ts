import { ApiProperty } from '@nestjs/swagger';

export class TokenUriResponseDto {
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
    description: 'The token ID for the specific NFT.',
    example: 2,
  })
  token_id: number;

  @ApiProperty({
    description: 'The URI of the token, which can be an HTTP or IPFS URL.',
    example:
      'https://ipfs.io/ipfs/QmXUpbiHn8R42REihF5K8iEdi5yq6Xg81nVTfETLfCfK6k/metadata.json',
  })
  token_uri: string;

  @ApiProperty({
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
  metadata: any; // Represents the JSON object containing the token's metadata.
}
