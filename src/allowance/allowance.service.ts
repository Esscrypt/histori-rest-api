import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { GetSingleAllowanceRequestDto } from 'src/dtos/request/get-single-allowance-request.dto';
import { AllowanceDto } from 'src/dtos/allowance.dto';
import { EthersHelperService } from 'src/services/ethers-helper.service';
import { SupportedNetworksService } from 'src/services/supported-networks.service';
import { AllowanceResponseDto } from 'src/dtos/response/allowance-response.dto';
import { ContractService } from 'src/contract/contract.service';
import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common/exceptions';

@Injectable()
export class AllowanceService {
  constructor(
    private readonly ethersHelperService: EthersHelperService,
    private readonly supportedNetworksService: SupportedNetworksService,
    private readonly contractService: ContractService,
  ) {}

  /**
   * Query a single allowance at a specific block number or timestamp
   */
  async getSingleAllowance(
    networkName: string,
    dto: GetSingleAllowanceRequestDto,
  ): Promise<AllowanceResponseDto> {
    const { token_address, date, block_height } = dto;
    let { owner, spender } = dto;

    let responseDto: AllowanceResponseDto | null = null;
    // Resolve ENS name if applicable
    try {
      owner = await this.ethersHelperService.resolveWalletAddress(
        networkName,
        owner,
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error: any) {}
    try {
      spender = await this.ethersHelperService.resolveWalletAddress(
        networkName,
        spender,
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error: any) {}

    const chainId = this.supportedNetworksService.getChainId(networkName);
    const provider = await this.ethersHelperService.getProvider(networkName);

    const finalBlockNumber = await this.ethersHelperService.getFinalBlockNumber(
      date,
      block_height,
      provider,
    );

    const token_type = await this.contractService.getTokenType(
      token_address,
      provider,
    );
    if (token_type !== 'erc20' && token_type !== 'erc777') {
      throw new BadRequestException(
        'Only ERC20 and ERC777 tokens are supported. Maybe you want to use the NFT approvals endpoint?',
      );
    }

    // Query the allowance at the specified block from the blockchain
    let allowanceDto: AllowanceDto;
    try {
      allowanceDto = await this.ethersHelperService.queryAllowanceWithEthers(
        owner,
        spender,
        token_address,
        finalBlockNumber,
        provider,
      );
    } catch (blockchainError) {
      console.error(`Blockchain query failed: ${blockchainError.message}`);
      throw new NotFoundException(
        'Historical Allowance does not exist for this owner and spender',
      );
    }

    let tokenDto;
    try {
      tokenDto = await this.ethersHelperService.queryTokenData(
        token_address,
        provider,
      );
    } catch (blockchainError) {
      console.error(`Blockchain query failed: ${blockchainError.message}`);
      throw new NotFoundException('Token Data not found for this balance.');
    }

    const checked_at_date =
      await this.ethersHelperService.convertBlockNumberToDateString(
        finalBlockNumber,
        provider,
      );

    responseDto = {
      network_name: networkName,
      chain_id: chainId,
      owner: allowanceDto.owner,
      spender: allowanceDto.spender,
      token_address: allowanceDto.contractAddress,
      token_name: tokenDto.name,
      token_symbol: tokenDto.symbol,
      token_type,
      checked_at_block: allowanceDto.blockNumber,
      checked_at_date,
      allowance: allowanceDto.allowance.toString(),
      allowance_eth: ethers.formatEther(allowanceDto.allowance.toString()),
    };

    return responseDto;
  }
}
