import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export enum GetGasPriceRequestDtoTransactionType {
  NATIVE_TRANSFER = 'native_transfer',
  ERC20_TRANSFER = 'erc20_transfer',
  SWAP = 'swap',
}

export class GetGasPriceRequestDto {
  @ApiProperty({
    description:
      'Type of transaction: native token transfer, ERC20 transfer, or swap.',
    enum: GetGasPriceRequestDtoTransactionType,
  })
  @IsEnum(GetGasPriceRequestDtoTransactionType, {
    message:
      'Invalid transaction type. Must be one of: native_transfer, erc20_transfer, swap',
  })
  @IsNotEmpty({ message: 'Transaction type is required.' })
  type: GetGasPriceRequestDtoTransactionType;
}
