import { Field, ObjectType, Int } from '@nestjs/graphql';

@ObjectType()
export class TokenSupply {
  @Field(() => String)
  contractAddress: string;

  @Field(() => Int)
  blockNumber: number;

  @Field(() => String)
  totalSupply: string;
}
