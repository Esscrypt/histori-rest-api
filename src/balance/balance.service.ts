import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Balance } from '../models/balance.entity';

@Injectable()
export class BalanceService {
  constructor(
    @InjectRepository(Balance)
    private readonly balanceRepository: Repository<Balance>,
  ) {}

  // Read balances with filters
  async getBalances(
    contractAddress?: string,
    holder?: string,
    tokenId?: string,  // Optional: Only applicable for ERC721/ERC1155
    blockNumber?: number,
    page: number = 1,
    limit: number = 10
  ) {
    const where: any = {};

    if (contractAddress) where.contractAddress = contractAddress;
    if (holder) where.holder = holder;
    if (tokenId) where.tokenId = tokenId;
    if (blockNumber) where.blockNumber = blockNumber;

    const skip = (page - 1) * limit;
    return this.balanceRepository.findAndCount({
      where,
      skip,
      take: limit,
    });
  }
}
