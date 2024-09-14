import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Balance } from 'src/models/balance.entity';
import { Token } from 'src/models/token.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,

    @InjectRepository(Balance)
    private readonly balanceRepository: Repository<Balance>,
  ) {}

  // Fetch paginated tokens with optional filter for token type
  async getAllTokens(tokenType: string | undefined, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const where: any = tokenType ? { tokenType } : {}; // Optional filter by token type

    return this.tokenRepository.findAndCount({
      where,
      skip,
      take: limit,
    });
  }

  // Fetch historical ERC20 token balances by wallet address and block number
  async getHistoricalERC20Balance(wallet: string, blockNumber: number) {
    return this.balanceRepository.findOne({
      where: { holder: wallet, blockNumber, tokenType: 'erc20' },
    });
  }

  // Fetch historical ERC721 token balances by wallet address and block number
  async getHistoricalERC721Balance(wallet: string, blockNumber: number) {
    return this.balanceRepository.findOne({
      where: { holder: wallet, blockNumber, tokenType: 'erc721' },
    });
  }

  // Get token holder addresses as of a given block number
  async getTokenHoldersAtBlock(contractAddress: string, blockNumber: number) {
    return this.balanceRepository.find({
      where: { contractAddress, blockNumber },
      select: ['holder'], // Only return holder addresses
    });
  }
}
