import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TokenUri {
  @Field(() => String)
  contractAddress: string;

  @Field(() => String)
  tokenId: string;
}
