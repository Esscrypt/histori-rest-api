import { ApiProperty } from '@nestjs/swagger';
import {
  IsEthereumAddress,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  ValidateIf,
  IsNumber,
} from 'class-validator';

export class GetHoldersRequestDto {
  @ApiProperty({
    description: 'The contract address of the ERC20/721/1155 token.',
    example: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
  })
  @IsNotEmpty()
  @IsEthereumAddress({ message: 'Invalid Ethereum address.' })
  tokenAddress: string;

  @ApiProperty({
    description: 'The block number for querying holders.',
    example: '123456',
    required: false,
  })
  @IsOptional()
  @ValidateIf((o) => !o.timestamp)
  @IsNumber()
  blockNumber?: number;

  @ApiProperty({
    description: 'The timestamp for querying holders (ISO 8601 format).',
    example: '2022-01-01T00:00:00Z',
    required: false,
  })
  @IsOptional()
  @ValidateIf((o) => !o.blockNumber)
  @IsDateString()
  timestamp?: string;
}
