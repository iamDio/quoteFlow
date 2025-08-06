import { Inject, Injectable } from '@nestjs/common';
import { CreateQuoteInput } from '../dto/quote.input';
import { Quote } from '../dto/quote.output';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class QuoteService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async getQuote(id: string) {
    const cacheKey = `quote:${id}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }
    const quote = await this.findQuoteInDb(id); // however you're doing it
    await this.cacheManager.set(cacheKey, quote, 60); // 60s TTL

    return quote;
  }

  private findQuoteInDb(id: string) {
    return {
      id,
      plan: 'Premium',
      monthlyPremium: 120.5,
      coverage: 'full',
    };
  }

  createQuote(input: CreateQuoteInput): Quote {
    return {
      monthlyPremium: 66,
      plan: 'premium',
      coverage: 'full',
    };
  }
}
