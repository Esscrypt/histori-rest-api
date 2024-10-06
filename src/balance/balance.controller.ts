import { Controller, Get, Param } from '@nestjs/common';
import { BalanceService } from './balance.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { BalanceDto } from 'src/dtos/balance.dto';

@ApiTags('Balances')
@Controller(':version/:network_name/balance')
export class BalanceController {
  constructor(private readonly balanceService: BalanceService) {}

  @Get(':wallet_address/:token_address/:block_number')
  @ApiOperation({
    summary:
      'Get balance by wallet, token, and block number for a given network.',
  })
  @ApiResponse({
    status: 200,
    description: 'The balance data.',
    type: BalanceDto,
  })
  @ApiParam({
    name: 'version',
    description: 'API version, currently only v1 is supported',
  })
  @ApiParam({
    name: 'network_name',
    description: 'Blockchain network, currently only eth-mainnet is supported',
  })
  @ApiParam({
    name: 'wallet_address',
    description: 'The wallet address of the user in hexadecimal format',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  @ApiParam({
    name: 'token_address',
    description: 'The contract address of the token in hexadecimal format',
    example: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
  })
  @ApiParam({
    name: 'block_number',
    description: 'The block number for which the balance is requested',
    example: 123456,
  })
  async getBalance(
    @Param('network_name') network_name: string,
    @Param('wallet_address') wallet_address: string,
    @Param('token_address') token_address: string,
    @Param('block_number') block_number: number,
  ): Promise<BalanceDto> {
    return this.balanceService.getBalance(
      network_name,
      wallet_address,
      token_address,
      block_number,
    );
  }
}
