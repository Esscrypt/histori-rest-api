import { Field, ObjectType, Int } from '@nestjs/graphql';

@ObjectType()
export class Balance {
  @Field(() => String)
  holder: string;

  @Field(() => String)
  contractAddress: string;

  @Field(() => String)
  balance: string;

  @Field(() => Int)
  blockNumber: number;

  @Field(() => String, { nullable: true })
  tokenId?: string; // Optional for ERC721
}
