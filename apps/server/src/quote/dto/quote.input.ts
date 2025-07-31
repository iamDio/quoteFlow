import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreateQuoteInput {
  @Field()
  name: string;

  @Field(() => Int)
  age: number;

  @Field()
  gender: string;

  @Field()
  zip: string;

  @Field()
  smoker: boolean;
}
