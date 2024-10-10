import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsNumberString,
  IsString,
  ValidateIf,
} from 'class-validator';

export class GetBlockRequestDto {
  @ApiPropertyOptional({
    description: 'The block number for which the block data is requested.',
    example: '123456',
  })
  @IsOptional()
  @IsNumberString({}, { message: 'Block number must be a numeric string.' })
  @ValidateIf((o) => !o.blockHash) // Only validate if blockHash is not provided
  blockNumber?: string;

  @ApiPropertyOptional({
    description: 'The block hash for which the block data is requested.',
    example: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
  })
  @IsOptional()
  @IsString()
  @ValidateIf((o) => !o.blockNumber) // Only validate if blockNumber is not provided
  blockHash?: string;
}
