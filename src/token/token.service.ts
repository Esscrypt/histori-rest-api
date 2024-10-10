import { Injectable } from '@nestjs/common';
import { GetTokenByAddressDto } from 'src/dtos/get-token-by-address.dto';
import { GetTokensRequestDto } from 'src/dtos/get-tokens-request.dto';
import { TokenDto } from 'src/dtos/token.dto';
import { Token } from 'src/entities/token.entity';
import { DynamicConnectionService } from 'src/services/dynamic-connection.service';

@Injectable()
export class TokenService {
  constructor(
    private readonly dynamicConnectionService: DynamicConnectionService,
  ) {}

  // Get paginated list of tokens, optionally filter by token type
  async getTokens(
    network_name: string,
    dto: GetTokensRequestDto,
  ): Promise<TokenDto[]> {
    const { tokenType, page = 1, limit = 10 } = dto;
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
      contractAddress: token.contractAddress,
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
    dto: GetTokenByAddressDto,
  ): Promise<TokenDto> {
    const { contractAddress } = dto;
    const tokenRepository =
      await this.dynamicConnectionService.getRepository<Token>(
        network_name,
        Token,
      );

    const token = await tokenRepository.findOne({
      where: { contractAddress },
    });

    if (!token) {
      return null;
    }

    return {
      contractAddress: token.contractAddress,
      blockNumber: token.blockNumber,
      tokenType: token.tokenType,
      name: token.name,
      symbol: token.symbol,
      decimals: token.decimals,
      granularity: token.granularity,
    };
  }
}
