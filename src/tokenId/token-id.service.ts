import { Injectable } from '@nestjs/common';
import { TokenIDDto } from 'src/dtos/token-id.dto';
import { TokenID } from 'src/entities/token-id.entity';
import { DynamicConnectionService } from 'src/services/dynamic-connection.service';

@Injectable()
export class TokenIDService {
  constructor(
    private readonly dynamicConnectionService: DynamicConnectionService,
  ) {}

  async getTokenID(
    networkName: string,
    contractAddress: string,
    tokenId: string,
  ): Promise<TokenIDDto> {
    // Get the repository dynamically based on the network
    const tokenIDRepository =
      await this.dynamicConnectionService.getRepository<TokenID>(
        networkName,
        TokenID,
      );

    // Query the token metadata
    const tokenID = await tokenIDRepository.findOne({
      where: {
        contractAddress,
        tokenId,
      },
    });

    // If no token metadata is found, return null
    if (!tokenID) {
      return null;
    }

    // Return the TokenIDDto with converted data
    return {
      contractAddress: tokenID.contractAddress,
      tokenId: tokenID.tokenId,
      tokenUri: tokenID.tokenURI,
    };
  }
}
