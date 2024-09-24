import { Injectable } from '@nestjs/common';
import { BalanceDto } from 'src/dtos/balance.dto';
import { Balance } from 'src/entities/balance.entity';
import { DynamicConnectionService } from 'src/services/dynamic-connection.service';
import { bufferToHexString, hexStringToBuffer } from 'src/utils/address-utils';

@Injectable()
export class BalanceService {
  constructor(
    private readonly dynamicConnectionService: DynamicConnectionService,
  ) {}

  async getBalance(
    network_name: string,
    wallet_address: string,
    token_address: string,
    block_number: number,
  ): Promise<BalanceDto> {
    // Get the repository dynamically based on the network
    const balanceRepository =
      await this.dynamicConnectionService.getRepository<Balance>(
        network_name,
        Balance,
      );

    // Query the balance entity
    const balance = await balanceRepository.findOne({
      where: {
        walletAddress: hexStringToBuffer(wallet_address),
        tokenAddress: hexStringToBuffer(token_address),
        blockNumber: block_number,
      },
    });

    // If no balance is found, return null
    if (!balance) {
      return null;
    }

    // Return the BalanceDto with converted data
    return {
      walletAddress: bufferToHexString(balance.walletAddress),
      tokenAddress: bufferToHexString(balance.tokenAddress),
      balance: balance.balance.toString(),
      blockNumber: balance.blockNumber,
      tokenId: balance.tokenId,
      tokenType: balance.tokenType,
    };
  }
}
