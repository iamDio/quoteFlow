import { Module } from '@nestjs/common';
import { QuoteService } from './quote.service';
import { QuoteResolver } from './quote.resolver';
import { RedisService } from '../redis/redis.service';

@Module({
  providers: [QuoteService, QuoteResolver, RedisService],
})
export class QuoteModule {}
