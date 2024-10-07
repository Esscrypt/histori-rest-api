import {
  IsNotEmpty,
  IsString,
  IsEthereumAddress,
  IsNumberString,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetAllowanceRequestDto {
  @ApiPropertyOptional({
    description: 'The ENS name or address of the owner in hexadecimal format.',
  })
  @IsNotEmpty()
  @IsString()
  owner: string;

  @ApiPropertyOptional({
    description:
      'The ENS name or address of the spender in hexadecimal format.',
  })
  @IsNotEmpty()
  @IsString()
  spender: string;

  @ApiPropertyOptional({
    description: 'The contract address of the token in hexadecimal format.',
  })
  @IsNotEmpty()
  @IsEthereumAddress()
  tokenAddress: string;

  @ApiPropertyOptional({
    description: 'The block number for which the allowance is requested.',
  })
  @IsNotEmpty()
  @IsNumberString({}, { message: 'Block number must be a numeric string.' })
  blockNumber: string;
}
