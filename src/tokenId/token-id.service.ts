import { Injectable } from '@nestjs/common';
import { TokenIDDto } from 'src/dtos/token-id.dto';
import { TokenID } from 'src/entities/token-id.entity';
import { DynamicConnectionService } from 'src/services/dynamic-connection.service';
import { bufferToHexString, hexStringToBuffer } from 'src/utils/address-utils';

@Injectable()
export class TokenIDService {
  constructor(
    private readonly dynamicConnectionService: DynamicConnectionService,
  ) {}

  async getTokenID(
    network_name: string,
    contract_address: string,
    token_id: number,
  ): Promise<TokenIDDto> {
    // Get the repository dynamically based on the network
    const tokenIDRepository =
      await this.dynamicConnectionService.getRepository<TokenID>(
        network_name,
        TokenID,
      );

    // Query the token metadata
    const tokenID = await tokenIDRepository.findOne({
      where: {
        contractAddress: hexStringToBuffer(contract_address),
        tokenId: token_id,
      },
    });

    // If no token metadata is found, return null
    if (!tokenID) {
      return null;
    }

    // Return the TokenIDDto with converted data
    return {
      contractAddress: bufferToHexString(tokenID.contractAddress),
      tokenId: tokenID.tokenId,
      tokenUri: tokenID.tokenUri || null,
    };
  }
}
