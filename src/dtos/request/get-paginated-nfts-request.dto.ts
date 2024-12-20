import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsEthereumAddress,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GetPaginatedNFTsRequestDto {
  @ApiProperty({
    description:
      'The unique identifier (contract address) of the NFT contract in hexadecimal format.',
    example: '0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB',
  })
  @IsEthereumAddress({
    message: 'it must be a valid address.',
  })
  address: string;

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
