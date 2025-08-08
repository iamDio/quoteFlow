import { InputType, Field, Int, Float } from '@nestjs/graphql';
import { IsInt, IsString, IsArray, Min, Max, IsIn } from 'class-validator';

@InputType()
export class QuoteInputDto {
  @Field(() => Int)
  @IsInt()
  @Min(18)
  @Max(80)
  age: number;

  @Field()
  @IsString()
  @IsIn(['male', 'female'])
  gender: string;

  @Field(() => Float)
  @Min(10000)
  @Max(5000000)
  coverageAmount: number;

  @Field(() => [String])
  @IsArray()
  healthConditions: string[];

  @Field()
  @IsString()
  @IsIn(['non-smoker', 'smoker', 'former-smoker'])
  smokingStatus: string;
}
