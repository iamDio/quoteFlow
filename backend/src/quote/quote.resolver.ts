import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { QuoteService } from './quote.service';
import { QuoteInputDto } from './dto/quote-input.dto';
import { QuoteResponseDto } from './dto/quote-response.dto';
import { NotFoundException } from '@nestjs/common';

@Resolver(() => QuoteResponseDto)
export class QuoteResolver {
  constructor(private readonly quoteService: QuoteService) {}

  @Mutation(() => QuoteResponseDto, {
    description: 'Calculate insurance quote',
  })
  async calculateQuote(
    @Args('input') input: QuoteInputDto,
  ): Promise<QuoteResponseDto> {
    return this.quoteService.calculateQuote(input);
  }

  @Query(() => QuoteResponseDto, { description: 'Get quote by ID' })
  async getQuote(@Args('quoteId') quoteId: string): Promise<QuoteResponseDto> {
    const quote = await this.quoteService.getQuote(quoteId);
    if (!quote) {
      throw new NotFoundException('Quote not found or expired');
    }
    return quote;
  }
}
