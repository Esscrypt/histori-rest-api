import { Injectable } from '@nestjs/common';
import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common/exceptions';
import { ContractService } from 'src/contract/contract.service';
import { GetTokenSupplyRequestDto } from 'src/dtos/request/get-token-supply-request.dto';
import { TokenSupplyResponseDto } from 'src/dtos/response/token-supply-response.dto';
import { TokenSupplyDto } from 'src/dtos/token-supply.dto';
import { SupportedNetworksService } from 'src/services/supported-networks.service';
import { EthersHelperService } from 'src/services/ethers-helper.service';

@Injectable()
export class TokenSupplyService {
  constructor(
    private readonly supportedNetworksService: SupportedNetworksService,
    private readonly ethersHelperService: EthersHelperService,
    private readonly contractService: ContractService,
  ) {}

  // Method to fetch token supply at a specific block number
  async getTokenSupply(
    networkName: string,
    dto: GetTokenSupplyRequestDto,
  ): Promise<TokenSupplyResponseDto> {
    const { token_address, block_height, date } = dto;

    // Initialize the blockchain provider using RPC URL
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
        'Only ERC20 and ERC777 tokens are supported. Maybe you want to use the NFT owner endpoint?',
      );
    }

    // If no token supply is found in the database, query the blockchain
    let blockchainSupply: TokenSupplyDto;
    try {
      blockchainSupply =
        await this.ethersHelperService.queryTokenSupplyFromBlockchain(
          token_address,
          finalBlockNumber,
          provider,
        );

      // If the blockchain query fails, throw an error
      if (!blockchainSupply) {
        throw new NotFoundException('Token Supply not found.');
      }
    } catch (blockchainError) {
      console.error(`Blockchain query failed: ${blockchainError.message}`);
      throw new NotFoundException(
        `Token Supply for Token ${token_address} not available as of block ${finalBlockNumber} on ${networkName}`,
      );
    }
    // Return the response based on the blockchain-sourced data
    return {
      network_name: networkName,
      chain_id: chainId,
      token_address: blockchainSupply.contractAddress,
      block_height: blockchainSupply.blockNumber,
      total_supply: blockchainSupply.totalSupply,
    };
  }
}
