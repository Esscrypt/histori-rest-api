import { ApiProperty } from '@nestjs/swagger';
import { NetworkChainResponseDto } from '../network-chainid.dto';

class StorageProofDto {
  @ApiProperty({
    description: 'The requested storage key.',
    example: '0x0',
  })
  key: string;

  @ApiProperty({
    description: 'The storage value at the specified key.',
    example:
      '0x0000000000000000000000000000000000000000000000000000000000000001',
  })
  value: string;

  @ApiProperty({
    description:
      'An array of RLP-serialized MerkleTree-Nodes for the storage proof.',
    example: [
      '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    ],
    type: [String],
  })
  proof: string[];
}

export class MerkleProofResponseDto extends NetworkChainResponseDto {
  @ApiProperty({
    description: 'The address associated with the account.',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  address: string;

  @ApiProperty({
    description:
      'An array of RLP-serialized MerkleTree-Nodes for the account proof.',
    example: [
      '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    ],
    type: [String],
  })
  accountProof: string[];

  @ApiProperty({
    description: 'The current balance of the account in wei.',
    example: '1000000000000000000', // 1 ETH in wei
  })
  balance: string;

  @ApiProperty({
    description: 'A 32-byte hash of the code of the account.',
    example:
      '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
  })
  codeHash: string;

  @ApiProperty({
    description: 'The nonce of the account.',
    example: '0x1',
  })
  nonce: string;

  @ApiProperty({
    description: 'A 32-byte SHA3 hash of the storage root.',
    example:
      '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
  })
  storageHash: string;

  @ApiProperty({
    description: 'An array of storage proofs for the requested keys.',
    type: [StorageProofDto],
  })
  storageProof: StorageProofDto[];
}
