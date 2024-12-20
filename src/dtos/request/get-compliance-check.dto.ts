import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { BlockHeightOrDateDto } from '../block-height-or-date.dto';

export class GetComplianceCheckDto extends BlockHeightOrDateDto {
  @ApiPropertyOptional({
    description: 'The type of token (e.g., USDC, USDT).',
    enum: ['USDC', 'USDC'],
    example: 'USDC',
  })
  @IsOptional()
  @IsIn(['USDC', 'USDT'], {
    message: 'Invalid request type. Must be one of USDC, USDT',
  })
  type?: string;

  @ApiProperty({
    description: 'The address or ENS name of the holder.',
    example: 'vitalik.eth',
  })
  holder: string;

  @ApiPropertyOptional({
    description: 'The contract address of the token.',
    example: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  })
  token_address?: string;
}
