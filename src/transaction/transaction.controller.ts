import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiParam,
} from '@nestjs/swagger';
import { TransactionService } from './transaction.service';

@ApiTags('Transactions')
@Controller(':network/transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get(':txHash')
  @ApiOperation({ summary: 'Fetch transaction details by hash' })
  @ApiResponse({
    status: 200,
    description: 'Transaction details fetched successfully.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid network name or transaction hash.',
  })
  @ApiParam({
    name: 'network',
    description:
      'Blockchain network name or chain id, currently only eth-mainnet (or 1) is supported',
    example: 'eth-mainnet',
  })
  async getTransactionDetails(
    @Param('network') networkName: string,
    @Param('txHash') txHash: string,
  ): Promise<any> {
    return this.transactionService.getTransactionDetails(networkName, txHash);
  }
}
