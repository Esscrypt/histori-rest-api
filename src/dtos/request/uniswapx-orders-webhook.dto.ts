import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumberString,
} from 'class-validator';

export class UniswapXOrdersWebhookDto {
  @ApiProperty({ description: 'The hash identifier for the order' })
  @IsString()
  @IsNotEmpty()
  orderHash: string;

  @ApiProperty({ description: 'Timestamp at which the order was posted' })
  @IsString()
  @IsNotEmpty()
  createdAt: string;

  @ApiProperty({
    description: 'The swapper signature to include with order execution',
  })
  @IsString()
  @IsNotEmpty()
  signature: string;

  @ApiProperty({ description: 'Current order status (always "open")' })
  @IsString()
  @IsNotEmpty()
  orderStatus: string;

  @ApiProperty({
    description:
      'The abi-encoded order to include with order execution, decodable using the UniswapX SDK',
  })
  @IsString()
  @IsNotEmpty()
  encodedOrder: string;

  @ApiProperty({ description: 'The chain ID that the order originates from' })
  @IsNumberString()
  chainId: number;

  @ApiProperty({
    description:
      'The filler address, if the order was quoted by an RFQ participant',
    required: false,
  })
  @IsString()
  @IsOptional()
  filler?: string;

  @ApiProperty({
    description:
      'The requestId from the quote request, if the order was quoted by an RFQ participant',
    required: false,
  })
  @IsString()
  @IsOptional()
  quoteId?: string;

  @ApiProperty({
    description: 'The swapper address (offerer)',
    required: false,
  })
  @IsString()
  @IsOptional()
  offerer?: string;

  @ApiProperty({
    description: 'The order type (e.g., "Dutch_V2", "Limit")',
    required: false,
  })
  @IsString()
  @IsOptional()
  type?: string;
}
