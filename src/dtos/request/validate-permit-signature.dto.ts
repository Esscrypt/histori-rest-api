import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEthereumAddress,
  IsNumber,
  IsNumberString,
  IsOptional,
} from 'class-validator';

export class ValidateSignatureDto {
  @ApiProperty({
    description: 'The name of the token (e.g., DAI).',
    example: 'DAI',
  })
  token_name: string;

  @ApiProperty({
    description: 'The owner of the tokens.',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  @IsEthereumAddress({ message: 'owner must be a valid Ethereum address' })
  owner: string;

  @ApiProperty({
    description: 'The address of the spender allowed to spend the tokens.',
    example: '0xabcdefabcdefabcdefabcdefabcdefabcdef1234',
  })
  @IsEthereumAddress({ message: 'spender must be a valid Ethereum address' })
  spender: string;

  @ApiProperty({
    description: 'The amount of tokens to be spent (in Wei).',
    example: '1000000000000000000', // 1 Token in Wei
  })
  @IsNumberString()
  value: string;

  @ApiProperty({
    description: 'The nonce of the owner at the time of signing.',
    example: '1',
  })
  nonce: number;

  @ApiProperty({
    description: 'The deadline (as a Unix timestamp) for the permit.',
    example: '1700000000',
  })
  @IsNumber()
  deadline: number;

  @ApiProperty({
    description: 'The EIP-712 signature being validated.',
    example:
      '0xSignature1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
  })
  signature: string;

  @ApiProperty({
    description: 'The address of the contract to verify against.',
    example: '0xContractAddress1234567890abcdef1234567890abcdef',
  })
  @IsEthereumAddress({
    message: 'contract_address must be a valid Ethereum address',
  })
  contract_address: string;

  @ApiPropertyOptional({
    description: 'The chain ID of the blockchain network.',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  chain_id?: number;
}
