import { IsOptional, IsIn, IsInt, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetTokensRequestDto {
  @ApiPropertyOptional({
    description: 'Filter by token type (erc20, erc721, erc777, erc1155)',
    enum: ['erc20', 'erc721', 'erc777', 'erc1155'],
    example: 'erc20',
    required: false,
  })
  @IsOptional()
  @IsIn(['erc20', 'erc721', 'erc777', 'erc1155'], {
    message:
      'Invalid token type. Must be one of erc20, erc721, erc777, erc1155',
  })
  token_type?: string;

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
