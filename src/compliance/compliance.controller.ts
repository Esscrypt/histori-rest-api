import { Controller, Get, Query, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ComplianceService } from './compliance.service';
import { CheckComplianceResponseDto } from 'src/dtos/response/check-compliance-response.dto';
import { GetComplianceCheckDto } from 'src/dtos/request/get-compliance-check.dto';

@ApiTags('Compliance')
@Controller(':network/compliance')
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  @Get('is-blacklisted')
  @ApiOperation({ summary: 'Check if an address is blacklisted.' })
  @ApiResponse({
    status: 200,
    description: 'Address blacklist status.',
    type: CheckComplianceResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid request parameters.' })
  @ApiParam({
    name: 'network',
    description: 'Blockchain network name or chain ID.',
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
  async isBlacklisted(
    @Param('network') network: string,
    @Query() dto: GetComplianceCheckDto,
  ): Promise<CheckComplianceResponseDto> {
    const { holder, token_address, type, date, block_height } = dto;
    return this.complianceService.isBlacklisted({
      network,
      holder,
      token_address,
      type,
      date,
      block_height,
    });
  }
}
