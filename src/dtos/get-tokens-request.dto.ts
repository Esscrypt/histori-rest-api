import { IsOptional, IsIn, IsInt, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetTokensRequestDto {
  @ApiPropertyOptional({
    description: 'Filter by token type (erc20, erc721, erc777, erc1155)',
    enum: ['erc20', 'erc721', 'erc777', 'erc1155'],
  })
  @IsOptional()
  @IsIn(['erc20', 'erc721', 'erc777', 'erc1155'])
  tokenType?: string;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Number of tokens per page, Max 100 per page',
    example: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
