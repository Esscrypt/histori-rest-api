import { Controller, Get, Param, Query } from '@nestjs/common';
import { AllowanceService } from './allowance.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { GetSingleAllowanceRequestDto } from 'src/dtos/request/get-single-allowance-request.dto';
import { AllowanceResponseDto } from 'src/dtos/response/allowance-response.dto';
// import { GetRangeAllowanceRequestDto } from 'src/dtos/get-range-allowance-request.dto';

@ApiTags('Allowances')
@Controller(':network/allowance')
export class AllowanceController {
  constructor(private readonly allowanceService: AllowanceService) {}

  @Get('single')
  @ApiOperation({
    summary:
      'Get allowance by owner, spender, token, and block number for a given network.',
  })
  @ApiResponse({
    status: 200,
    description: 'The allowance data.',
    type: AllowanceResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request parameters.',
  })
  @ApiResponse({
    status: 404,
    description:
      'Historical Allowance does not exist for this owner and spender.',
  })
  @ApiParam({
    name: 'network',
    description: 'Blockchain network name or chain id',
    example: 'eth-mainnet',
    required: true,
  })
  @ApiQuery({
    name: 'projectId',
    description:
      'The id of your project. Can be found in your Histori dashboard.',
    example: '8ry9f6t9dct1se2hlagxnd9n2a',
    required: true,
    type: 'string',
  })
  async getAllowance(
    @Param('network') networkName: string,
    @Query() query: GetSingleAllowanceRequestDto,
  ): Promise<AllowanceResponseDto> {
    return this.allowanceService.getSingleAllowance(networkName, query);
  }
}
