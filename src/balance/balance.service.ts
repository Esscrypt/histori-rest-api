import { Injectable } from '@nestjs/common';
import { BalanceDto } from 'src/dtos/balance.dto';
import { Balance } from 'src/entities/balance.entity';
import { DynamicConnectionService } from 'src/services/dynamic-connection.service';

@Injectable()
export class BalanceService {
  constructor(
    private readonly dynamicConnectionService: DynamicConnectionService,
  ) {}

  async getBalance(
    networkName: string,
    holder: string,
    contractAddress: string,
    blockNumber: number,
  ): Promise<BalanceDto> {
    // Get the repository dynamically based on the network
    const balanceRepository =
      await this.dynamicConnectionService.getRepository<Balance>(
        networkName,
        Balance,
      );

    // Query the balance entity
    const balance = await balanceRepository.findOne({
      where: {
        holder,
        contractAddress,
        blockNumber,
      },
    });

    // If no balance is found, return null
    if (!balance) {
      return null;
    }

    // Return the BalanceDto with converted data
    return {
      holder: balance.holder,
      contractAddress: balance.contractAddress,
      balance: balance.balance,
      blockNumber: balance.blockNumber,
      tokenId: balance.tokenId,
    };
  }
}
