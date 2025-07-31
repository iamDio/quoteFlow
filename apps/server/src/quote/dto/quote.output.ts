import { ObjectType, Field, Float } from '@nestjs/graphql';

@ObjectType()
export class Quote {
  @Field(() => Float)
  monthlyPremium: number;

  @Field()
  plan: string;

  @Field()
  coverage: string;
}
