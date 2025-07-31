import { Injectable } from '@nestjs/common';
import { CreateQuoteInput } from '../dto/quote.input';
import { Quote } from '../dto/quote.output';

@Injectable()
export class QuoteService {
  createQuote(input: CreateQuoteInput): Quote {
    return {
      monthlyPremium: 66,
      plan: 'premium',
      coverage: 'full',
    };
  }
}
