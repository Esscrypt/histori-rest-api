import { Field, ObjectType, Int } from '@nestjs/graphql';

@ObjectType()
export class Token {
  @Field(() => String)
  contractAddress: string;

  @Field(() => Int)
  blockNumber: number;

  @Field(() => String)
  tokenType: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  symbol: string;

  @Field(() => Int, { nullable: true })
  decimals?: number;

  @Field(() => String, { nullable: true })
  granularity?: string;
}
