import { Injectable } from '@nestjs/common';
import { TokenDto } from 'src/dtos/token.dto';
import { Token } from 'src/entities/token.entity';
import { DynamicConnectionService } from 'src/services/dynamic-connection.service';
import { bufferToHexString, hexStringToBuffer } from 'src/utils/address-utils';

@Injectable()
export class TokenService {
  constructor(
    private readonly dynamicConnectionService: DynamicConnectionService,
  ) {}

  // Get paginated list of tokens, optionally filter by token type
  async getPaginatedTokens(
    network_name: string,
    tokenType: string | undefined,
    page: number,
    limit: number,
  ): Promise<TokenDto[]> {
    const tokenRepository =
      await this.dynamicConnectionService.getRepository<Token>(
        network_name,
        Token,
      );

    const skip = (page - 1) * limit;
    const where: any = tokenType ? { tokenType } : {};

    const tokens = await tokenRepository.find({
      where,
      skip,
      take: limit,
    });

    return tokens.map((token) => ({
      tokenAddress: bufferToHexString(token.tokenAddress),
      blockNumber: token.blockNumber,
      tokenType: token.tokenType,
      name: token.name,
      symbol: token.symbol,
      decimals: token.decimals,
      granularity: token.granularity,
    }));
  }

  // Get token by contract address
  async getTokenByAddress(
    network_name: string,
    contractAddress: string,
  ): Promise<TokenDto> {
    const tokenRepository =
      await this.dynamicConnectionService.getRepository<Token>(
        network_name,
        Token,
      );

    const token = await tokenRepository.findOne({
      where: { tokenAddress: hexStringToBuffer(contractAddress) },
    });

    if (!token) {
      return null;
    }

    return {
      tokenAddress: bufferToHexString(token.tokenAddress),
      blockNumber: token.blockNumber,
      tokenType: token.tokenType,
      name: token.name,
      symbol: token.symbol,
      decimals: token.decimals,
      granularity: token.granularity,
    };
  }
}
