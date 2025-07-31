import { Module } from '@nestjs/common';
import { QuoteController } from './quote.controller';
import { QuoteService } from './quote.service';
import { QuoteResolver } from '../quote.resolver';

@Module({
  controllers: [QuoteController],
  providers: [QuoteService, QuoteResolver],
})
export class QuoteModule {}
