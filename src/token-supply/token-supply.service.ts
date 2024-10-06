import { Injectable } from '@nestjs/common';
import { TokenSupplyDto } from 'src/dtos/token-supply.dto';
import { TokenSupply } from 'src/entities/token-supply.entity';
import { DynamicConnectionService } from 'src/services/dynamic-connection.service';

@Injectable()
export class TokenSupplyService {
  constructor(
    private readonly dynamicConnectionService: DynamicConnectionService,
  ) {}

  async getTokenSupply(
    network_name: string,
    contractAddress: string,
    block_number: number,
  ): Promise<TokenSupplyDto> {
    // Get the repository dynamically based on the network
    const tokenSupplyRepository =
      await this.dynamicConnectionService.getRepository<TokenSupply>(
        network_name,
        TokenSupply,
      );

    // Query the token supply
    const tokenSupply = await tokenSupplyRepository.findOne({
      where: {
        contractAddress: contractAddress,
        blockNumber: block_number,
      },
    });

    // If no token supply is found, return null
    if (!tokenSupply) {
      return null;
    }

    // Return the TokenSupplyDto with converted data
    return {
      contractAddress: tokenSupply.contractAddress,
      blockNumber: tokenSupply.blockNumber,
      totalSupply: tokenSupply.totalSupply.toString(),
    };
  }
}
