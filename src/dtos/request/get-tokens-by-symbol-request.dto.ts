import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GetTokensBySymbolRequestDto {
  @ApiProperty({
    description: 'Symbol of the token',
    example: 'DOGE2.0',
    required: true,
  })
  token_symbol: string;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Number of tokens per page, Max 100 per page',
    example: 10,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
