import { Args, Resolver, Mutation, Query } from '@nestjs/graphql';
import { Quote } from './dto/quote.output';
import { QuoteService } from './quote/quote.service';
import { CreateQuoteInput } from './dto/quote.input';

@Resolver(() => Quote)
export class QuoteResolver {
  constructor(private readonly quoteService: QuoteService) {}

  @Query(() => Quote)
  sampleQuote(): Quote {
    return {
      monthlyPremium: 100.0,
      plan: 'Sample User',
      coverage: 'premium',
    };
  }

  @Mutation(() => Quote)
  async createQuote(@Args('input') input: CreateQuoteInput): Promise<Quote> {
    return Promise.resolve(this.quoteService.createQuote(input));
  }
}
