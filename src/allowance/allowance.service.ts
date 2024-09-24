import { Injectable } from '@nestjs/common';
import { AllowanceDto } from 'src/dtos/allowance.dto';
import { Allowance } from 'src/entities/allowance.entity';
import { DynamicConnectionService } from 'src/services/dynamic-connection.service';
import { bufferToHexString, hexStringToBuffer } from 'src/utils/address-utils';

@Injectable()
export class AllowanceService {
  constructor(
    private readonly dynamicConnectionService: DynamicConnectionService,
  ) {}

  async getAllowance(
    network_name: string,
    owner_address: string,
    spender_address: string,
    token_address: string,
    block_number: number,
  ): Promise<AllowanceDto> {
    const allowanceRepository =
      await this.dynamicConnectionService.getRepository<Allowance>(
        network_name,
        Allowance,
      );

    const allowance = await allowanceRepository.findOne({
      where: {
        ownerAddress: hexStringToBuffer(owner_address),
        spenderAddress: hexStringToBuffer(spender_address),
        tokenAddress: hexStringToBuffer(token_address),
        blockNumber: block_number,
      },
    });

    if (!allowance) {
      return null;
    }

    // Convert the entity to DTO
    return {
      ownerAddress: bufferToHexString(allowance.ownerAddress),
      spenderAddress: bufferToHexString(allowance.spenderAddress),
      tokenAddress: bufferToHexString(allowance.tokenAddress),
      blockNumber: allowance.blockNumber,
      allowance: allowance.allowance ? allowance.allowance.toString() : null,
      tokenId: allowance.tokenId,
      tokenType: allowance.tokenType,
    };
  }
}
