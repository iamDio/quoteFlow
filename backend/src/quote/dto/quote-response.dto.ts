import { ObjectType, Field, Float, ID } from '@nestjs/graphql';

@ObjectType()
export class QuoteResponseDto {
  @Field(() => ID)
  quoteId: string;

  @Field(() => Float)
  monthlyPremium: number;

  @Field(() => Float)
  annualPremium: number;

  @Field(() => Float)
  coverageAmount: number;

  @Field()
  riskClass: string;

  @Field()
  expiresAt: string;

  @Field()
  createdAt: string;
}
