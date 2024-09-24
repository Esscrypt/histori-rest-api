import { Controller, Get, Param } from '@nestjs/common';
import { AllowanceService } from './allowance.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { AllowanceDto } from 'src/dtos/allowance.dto';

@ApiTags('Allowances')
@Controller(':version/:network_name/allowance')
export class AllowanceController {
  constructor(private readonly allowanceService: AllowanceService) {}

  @Get(':owner_address/:spender_address/:token_address/:block_number')
  @ApiOperation({
    summary:
      'Get allowance by owner, spender, token, and block number for a given network.',
  })
  @ApiResponse({
    status: 200,
    description: 'The allowance data.',
    type: AllowanceDto,
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
    name: 'owner_address',
    description: 'The wallet address of the owner in hexadecimal format',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  @ApiParam({
    name: 'spender_address',
    description: 'The wallet address of the spender in hexadecimal format',
    example: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
  })
  @ApiParam({
    name: 'token_address',
    description: 'The contract address of the token in hexadecimal format',
    example: '0x1234567890abcdef1234567890abcdefabcdef12',
  })
  @ApiParam({
    name: 'block_number',
    description: 'The block number for which the allowance is requested',
    example: 123456,
  })
  async getAllowance(
    @Param('network_name') network_name: string,
    @Param('owner_address') owner_address: string,
    @Param('spender_address') spender_address: string,
    @Param('token_address') token_address: string,
    @Param('block_number') block_number: number,
  ): Promise<AllowanceDto> {
    return this.allowanceService.getAllowance(
      network_name,
      owner_address,
      spender_address,
      token_address,
      block_number,
    );
  }
}
