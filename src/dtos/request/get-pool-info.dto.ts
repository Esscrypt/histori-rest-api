import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class GetPoolInfoDto {
  @ApiProperty({
    description: 'The address of the Uniswap pool contract.',
    example: '0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8',
  })
  @IsString()
  @IsNotEmpty()
  pool_address: string;
}
