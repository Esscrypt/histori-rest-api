import { Resolver, Query, Args } from '@nestjs/graphql';
import { TokenSupply } from '../schemas/token-supply.schema';
import { TokenSupplyService } from 'src/token-supply/token-supply.service';

@Resolver(() => TokenSupply)
export class TokenSupplyResolver {
  constructor(private readonly tokenSupplyService: TokenSupplyService) {}

  @Query(() => TokenSupply)
  getTokenSupply(
    @Args('version', { type: () => String }) version: string,
    @Args('networkName', { type: () => String }) networkName: string,
    @Args('tokenAddress', { type: () => String }) tokenAddress: string,
    @Args('blockNumber', { type: () => Number }) blockNumber: number,
  ) {
    return this.tokenSupplyService.getTokenSupply(
      networkName,
      tokenAddress,
      blockNumber,
    );
  }
}
