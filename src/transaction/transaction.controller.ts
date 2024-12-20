import {
  // BadRequestException,
  Controller,
  Get,
  Logger,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { TransactionService } from './transaction.service';
import { GetTransactionRequestDto } from 'src/dtos/request/get-transaction-request.dto';
// import { Body, Query } from '@nestjs/common/decorators';
import { TransactionResponseDto } from 'src/dtos/response/transaction-response.dto';
import { SupportedNetworksService } from 'src/services/supported-networks.service';
import { EthersHelperService } from 'src/services/ethers-helper.service';
import { PricingService } from 'src/pricing/pricing.service';
// import { ethers } from 'ethers';

@ApiTags('Transactions')
@Controller(':network/transaction')
export class TransactionController {
  logger = new Logger(TransactionController.name);

  constructor(
    private readonly transactionService: TransactionService,
    private readonly supportedNetworksService: SupportedNetworksService,
    private readonly ethersHelperService: EthersHelperService,
    private readonly pricingService: PricingService,
  ) {}

  @Get('')
  @ApiOperation({ summary: 'Fetch transaction details by hash' })
  @ApiResponse({
    status: 200,
    description: 'Transaction details fetched successfully.',
    type: TransactionResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Transaction not found.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid network name or transaction hash.',
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
  async getTransactionDetails(
    @Param('network') networkName: string,
    @Query() dto: GetTransactionRequestDto,
  ): Promise<TransactionResponseDto> {
    const { tx_hash, currency } = dto;
    const chainId = this.supportedNetworksService.getChainId(networkName);
    const provider = await this.ethersHelperService.getProvider(networkName);

    let weiToUSD;
    try {
      //NOTE: to save on RPC calls and waiting time,
      // we can fetch the USD gas price for the start block of the range
      weiToUSD = await this.pricingService.getWeiToUSD(networkName);
      this.logger.debug(`Wei to USD: ${weiToUSD.toString()}`);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // no conversion is available for this network, continue
    }

    const transactionResponse =
      await this.transactionService.getTransactionDetails({
        txHash: tx_hash,
        weiToUSD,
        provider,
        currency,
        fetch_logs: true,
      });
    return {
      network_name: networkName,
      chain_id: chainId,
      transaction: transactionResponse,
    };
  }

  // @Get('multicall')
  // @ApiOperation({
  //   summary:
  //     'Create a multicall transaction from multiple RLP-encoded transactions.',
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Multicall transaction created successfully.',
  //   type: MulticallResponseDto,
  // })
  // @ApiBadRequestResponse({
  //   description: 'Invalid input or network configuration.',
  // })
  // @ApiParam({
  //   name: 'network',
  //   description: 'Blockchain network name or chain id',
  //   example: 'eth-mainnet',
  //   required: true,
  // })
  // @ApiQuery({
  //   name: 'encodedCalls',
  //   description: 'Array of RLP-encoded transactions',
  //   example: ['0x123', '0x456', '0x789'],
  //   isArray: true,
  //   required: true,
  // })
  // async createMulticallTransaction(
  //   @Param('network') networkName: string,
  //   @Query('encodedCalls') encodedCalls: string,
  // ): Promise<MulticallResponseDto> {
  //   const encodedCallArray = encodedCalls.split(',');

  //   const chainId = this.supportedNetworksService.getChainId(networkName);
  //   const provider = await this.ethersHelperService.getProvider(networkName);

  //   this.logger.debug(`Creating multicall for network ${networkName}`);

  //   // Use the service to create a multicall transaction
  //   const multicallTransaction = await this.transactionService.createMulticall({
  //     provider,
  //     encodedCallArray,
  //     chainId,
  //   });

  //   return {
  //     network_name: networkName,
  //     chain_id: chainId,
  //     multicall_transaction: multicallTransaction,
  //   };
  // }

  // @Get('json-rpc-payload')
  // @ApiOperation({
  //   summary: 'Generate JSON-RPC payload for a transaction request.',
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: 'JSON-RPC payload generated successfully.',
  // })
  // @ApiBadRequestResponse({
  //   description: 'Invalid input or transaction details.',
  // })
  // @ApiParam({
  //   name: 'network',
  //   description: 'Blockchain network name or chain id',
  //   example: 'eth-mainnet',
  //   required: true,
  // })
  // async getTransactionJsonRpcPayload(
  //   @Param('network') networkName: string,
  //   @Query() dto: GetTransactionJsonRpcPayloadDto,
  // ): Promise<any> {
  //   const { rlp, from, to, data, value, gas } = dto;

  //   if (!rlp && (!from || !to || !data)) {
  //     throw new BadRequestException(
  //       'Either RLP-encoded data or transaction constituents (from, to, data) must be provided.',
  //     );
  //   }

  //   const provider = await this.ethersHelperService.getProvider(networkName);

  //   if (rlp) {
  //     try {
  //       const transaction = ethers.Transaction.from(rlp);
  //       // if the transaction is signed it must be a send transaction
  //       if (transaction.signature) {
  //         this.logger.debug('Transaction mutates state (send).');
  //         return {
  //           jsonrpc: '2.0',
  //           method: 'eth_sendTransaction',
  //           params: [transaction],
  //           id: 1,
  //         };
  //       }
  //       this.logger.debug('Transaction does not mutate state (call).');
  //       return {
  //         jsonrpc: '2.0',
  //         method: 'eth_call',
  //         //TODO: expose a block number query parameter
  //         params: [transaction, 'latest'],
  //         id: 1,
  //       };
  //       // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //     } catch (error) {
  //       throw new BadRequestException('Invalid RLP-encoded transaction.');
  //     }
  //   } else {
  //     // Determine if the transaction mutates state (i.e., "send") or not ("call").
  //     try {
  //       const result = await provider.estimateGas({ from, to, data, value });
  //       this.logger.debug('Transaction does not mutate state (call).');
  //       return {
  //         jsonrpc: '2.0',
  //         method: 'eth_call',
  //         params: [transaction, 'latest'],
  //         id: 1,
  //       };
  //     } catch (error) {
  //       if (error.code === ethers.UNPREDICTABLE_GAS_LIMIT) {
  //         this.logger.debug('Transaction mutates state (send).');
  //         return {
  //           jsonrpc: '2.0',
  //           method: 'eth_sendTransaction',
  //           params: [transaction],
  //           id: 1,
  //         };
  //       }
  //       throw error;
  //     }
  //   }
  // }
}
