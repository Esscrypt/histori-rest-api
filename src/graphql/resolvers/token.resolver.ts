import { Resolver, Query, Args } from '@nestjs/graphql';
import { Token } from '../schemas/token.schema';
import { TokenService } from 'src/token/token.service';
import { GetTokensRequestDto } from 'src/dtos/get-tokens-request.dto';
import { validate } from 'class-validator';
import { GetTokenByAddressDto } from 'src/dtos/get-token-by-address.dto';

@Resolver(() => Token)
export class TokenResolver {
  constructor(private readonly tokenService: TokenService) {}

  @Query(() => [Token])
  async getTokens(
    @Args('networkName', { type: () => String }) networkName: string,
    @Args('tokenType', { type: () => String, nullable: true })
    tokenType?: string,
    @Args('page', { type: () => Number, nullable: true }) page?: number,
    @Args('limit', { type: () => Number, nullable: true }) limit?: number,
  ) {
    const dto: GetTokensRequestDto = {
      tokenType,
      page,
      limit,
    };
    await validate(dto);
    return this.tokenService.getTokens(networkName, dto);
  }

  @Query(() => Token)
  async getTokenByAddress(
    @Args('version', { type: () => String }) version: string,
    @Args('networkName', { type: () => String }) networkName: string,
    @Args('contractAddress', { type: () => String }) contractAddress: string,
  ) {
    const dto: GetTokenByAddressDto = {
      contractAddress,
    };
    await validate(dto);
    return this.tokenService.getTokenByAddress(networkName, dto);
  }
}
