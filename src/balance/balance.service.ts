import { Injectable } from '@nestjs/common';
import { BalanceDto } from 'src/dtos/balance.dto';
import { EthersHelperService } from 'src/services/ethers-helper.service';
import { SupportedNetworksService } from 'src/services/supported-networks.service';
import { BalanceResponseDto } from 'src/dtos/response/balance-response.dto';
import { TokenDto } from 'src/dtos/token.dto';
import { ContractService } from 'src/contract/contract.service';
import { ethers } from 'ethers';

import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common/exceptions';
import { NativeBalanceResponseDto } from 'src/dtos/response/native-balance-response.dto';

@Injectable()
export class BalanceService {
  constructor(
    private readonly ethersHelperService: EthersHelperService,
    private readonly supportedNetworksService: SupportedNetworksService,
    private readonly contractService: ContractService,
  ) {}

  /**
   * Query a single balance at a specific block number or timestamp
   */
  async getSingleBalance({
    networkName,
    token_address,
    holder,
    date,
    block_height,
  }: {
    networkName: string;
    holder: string;
    token_address: string;
    date?: string;
    block_height?: number;
  }): Promise<BalanceResponseDto> {
    let responseDto: BalanceResponseDto | null = null;
    // Resolve ENS name if applicable
    try {
      holder = await this.ethersHelperService.resolveWalletAddress(
        networkName,
        holder,
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error: any) {}

    const chainId = this.supportedNetworksService.getChainId(networkName);
    // Initialize the provider
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
        'Only ERC20 and ERC777 tokens are supported. Maybe you want to use the NFT owner endpoint?',
      );
    }
    // Query the balance from the blockchain
    let balanceDto: BalanceDto;
    let tokenDto: TokenDto;
    try {
      balanceDto = await this.ethersHelperService.queryBalanceWithEthers(
        holder,
        token_address,
        finalBlockNumber,
        provider,
      );
    } catch (blockchainError) {
      console.error(`Blockchain query failed: ${blockchainError.message}`);
      throw new NotFoundException(
        'Historical Balance does not Exist for this holder.',
      );
    }

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
      holder: balanceDto.holder,
      token_address: balanceDto.contractAddress,
      token_name: tokenDto.name,
      token_symbol: tokenDto.symbol,
      token_type: token_type,
      checked_at_block: balanceDto.blockNumber,
      checked_at_date,
      balance: balanceDto.balance,
      balance_eth: ethers.formatUnits(balanceDto.balance, 'ether'),
    };
    return responseDto;
  }

  async getNativeBalance({
    networkName,
    holder,
    date,
    block_height,
  }: {
    networkName: string;
    holder: string;
    date?: string;
    block_height?: number;
  }): Promise<NativeBalanceResponseDto> {
    let responseDto: NativeBalanceResponseDto | null = null;
    // Resolve ENS name if applicable
    try {
      holder = await this.ethersHelperService.resolveWalletAddress(
        networkName,
        holder,
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error: any) {}

    const chainId = this.supportedNetworksService.getChainId(networkName);
    // Initialize the provider
    const provider = await this.ethersHelperService.getProvider(networkName);

    const finalBlockNumber = await this.ethersHelperService.getFinalBlockNumber(
      date,
      block_height,
      provider,
    );

    const wallet_balance = await provider.getBalance(holder, finalBlockNumber);

    const checked_at_date =
      await this.ethersHelperService.convertBlockNumberToDateString(
        finalBlockNumber,
        provider,
      );

    responseDto = {
      network_name: networkName,
      chain_id: chainId,
      holder,
      checked_at_block: finalBlockNumber,
      checked_at_date,
      balance: wallet_balance.toString(),
      balance_eth: ethers.formatUnits(wallet_balance, 'ether'),
    };
    return responseDto;
  }
}
