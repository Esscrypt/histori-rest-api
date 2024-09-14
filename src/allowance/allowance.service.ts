import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Allowance } from '../models/allowance.entity';

@Injectable()
export class AllowanceService {
  constructor(
    @InjectRepository(Allowance)
    private readonly allowanceRepository: Repository<Allowance>,
  ) {}

  // Read allowances with filters
  async getAllowances(
    contractAddress?: string,
    owner?: string,
    spender?: string,
    tokenType?: string,
    tokenId?: string,  // Optional: Only applicable for ERC721/ERC1155
    blockNumber?: number,
    page: number = 1,
    limit: number = 10
  ) {
    const where: any = {};

    if (contractAddress) where.contractAddress = contractAddress;
    if (owner) where.owner = owner;
    if (spender) where.spender = spender;
    if (tokenType) where.tokenType = tokenType;
    if (tokenId) where.tokenId = tokenId;
    if (blockNumber) where.blockNumber = blockNumber;

    const skip = (page - 1) * limit;
    return this.allowanceRepository.findAndCount({
      where,
      skip,
      take: limit,
    });
  }
}
