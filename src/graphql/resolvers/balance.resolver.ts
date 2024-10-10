import { Resolver, Query, Args } from '@nestjs/graphql';
import { Balance } from '../schemas/balance.schema';
import { BalanceService } from 'src/balance/balance.service';
import { GetSingleBalanceRequestDto } from 'src/dtos/get-single-balance-request.dto';
import { validate } from 'class-validator';

@Resolver(() => Balance)
export class BalanceResolver {
  constructor(private readonly balanceService: BalanceService) {}

  @Query(() => [Balance])
  async getBalance(
    @Args('version', { type: () => String }) version: string,
    @Args('networkName', { type: () => String }) networkName: string,
    @Args('holder', { type: () => String }) holder: string,
    @Args('tokenAddress', { type: () => String }) tokenAddress: string,
    @Args('blockNumber', { type: () => Number, nullable: true })
    blockNumber?: number,
    @Args('timestamp', { type: () => Date, nullable: true }) timestamp?: Date,
  ) {
    // Build the DTO with the provided arguments
    const dto: GetSingleBalanceRequestDto = {
      holder: holder,
      tokenAddress: tokenAddress,
      blockNumber: blockNumber, // Convert blockNumber to string if provided
      timestamp: timestamp?.toISOString(), // Convert timestamp to ISO string if provided
    };

    await validate(dto);

    // Call the BalanceService to fetch the balance(s)
    return this.balanceService.getSingleBalance(networkName, dto);
  }
}
