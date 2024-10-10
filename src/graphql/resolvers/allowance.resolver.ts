import { Resolver, Query, Args } from '@nestjs/graphql';
import { Allowance } from '../schemas/allowance.schema';
import { AllowanceService } from 'src/allowance/allowance.service';

@Resolver(() => Allowance)
export class AllowanceResolver {
  constructor(private readonly allowanceService: AllowanceService) {}

  @Query(() => Allowance)
  getAllowance(
    @Args('version', { type: () => String }) version: string,
    @Args('networkName', { type: () => String }) networkName: string,
    @Args('tokenAddress', { type: () => String }) tokenAddress: string,
    @Args('blockNumber', { type: () => Number }) blockNumber: number,
    @Args('owner', { type: () => String, nullable: true }) owner?: string,
    @Args('spender', { type: () => String, nullable: true }) spender?: string,
  ) {
    const dto = {
      owner,
      spender,
      tokenAddress,
      blockNumber,
    };

    return this.allowanceService.getSingleAllowance(networkName, dto);
  }
}
