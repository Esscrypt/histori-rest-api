import { Field, ObjectType, Int } from '@nestjs/graphql';

@ObjectType()
export class Allowance {
  @Field(() => String)
  contractAddress: string;

  @Field(() => String)
  owner: string;

  @Field(() => String)
  spender: string;

  @Field(() => String, { nullable: true })
  allowance?: string; // Optional for ERC721 and ERC1155

  @Field(() => Int)
  blockNumber: number;

  @Field(() => String)
  tokenType: string;

  @Field(() => String, { nullable: true })
  tokenId?: string; // Optional for non-fungible tokens
}
