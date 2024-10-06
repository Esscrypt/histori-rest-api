import { Injectable } from '@nestjs/common';
import { AllowanceDto } from 'src/dtos/allowance.dto';
import { Allowance } from 'src/entities/allowance.entity';
import { DynamicConnectionService } from 'src/services/dynamic-connection.service';

@Injectable()
export class AllowanceService {
  constructor(
    private readonly dynamicConnectionService: DynamicConnectionService,
  ) {}

  async getAllowance(
    networkName: string,
    owner: string,
    spender: string,
    contractAddress: string,
    blockNumber: number,
  ): Promise<AllowanceDto> {
    const allowanceRepository =
      await this.dynamicConnectionService.getRepository<Allowance>(
        networkName,
        Allowance,
      );

    const allowance = await allowanceRepository.findOne({
      where: {
        owner,
        spender,
        contractAddress,
        blockNumber,
      },
    });

    if (!allowance) {
      return null;
    }

    // Convert the entity to DTO
    return {
      owner: allowance.owner,
      spender: allowance.spender,
      contractAddress: allowance.contractAddress,
      blockNumber: allowance.blockNumber,
      allowance: allowance.allowance,
      tokenId: allowance.tokenId,
      tokenType: allowance.tokenType,
    };
  }
}
