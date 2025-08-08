import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { QuoteInputDto } from './dto/quote-input.dto';
import { QuoteResponseDto } from './dto/quote-response.dto';
import { v4 as uuidv4 } from 'uuid';

// Type definitions for better type safety
type Gender = 'male' | 'female';
type AgeGroup = '18-30' | '31-45' | '46-60' | '61-80';
type SmokingStatus = 'non-smoker' | 'smoker' | 'former-smoker';
type RiskClass = 'PREFERRED' | 'STANDARD' | 'HIGH';

interface RateTable {
  male: Record<AgeGroup, number>;
  female: Record<AgeGroup, number>;
}

@Injectable()
export class QuoteService {
  constructor(private readonly redisService: RedisService) {}

  async calculateQuote(input: QuoteInputDto): Promise<QuoteResponseDto> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const quoteId: string = uuidv4();

    // Simple premium calculation logic
    const baseRate = this.getBaseRate(input.age, input.gender as Gender);
    const healthMultiplier = this.getHealthMultiplier(
      input.healthConditions,
      input.smokingStatus as SmokingStatus,
    );

    const annualPremium =
      (input.coverageAmount * baseRate * healthMultiplier) / 1000;
    const monthlyPremium = annualPremium / 12;

    const quote: QuoteResponseDto = {
      quoteId,
      monthlyPremium: Math.round(monthlyPremium * 100) / 100,
      annualPremium: Math.round(annualPremium * 100) / 100,
      coverageAmount: input.coverageAmount,
      riskClass: this.getRiskClass(
        input.age,
        input.smokingStatus as SmokingStatus,
        input.healthConditions,
      ),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      createdAt: new Date().toISOString(),
    };

    await this.redisService.set(
      `quote:${quoteId}`,
      JSON.stringify(quote),
      30 * 24 * 60 * 60,
    );

    return quote;
  }

  async getQuote(quoteId: string): Promise<QuoteResponseDto | null> {
    const cached = await this.redisService.get(`quote:${quoteId}`);
    if (!cached) {
      return null;
    }

    try {
      const parsed: QuoteResponseDto = JSON.parse(cached) as QuoteResponseDto;
      return parsed;
    } catch (error) {
      console.error('Failed to parse cached quote:', error);
      return null;
    }
  }

  private getBaseRate(age: number, gender: Gender): number {
    const rates: RateTable = {
      male: {
        '18-30': 0.8,
        '31-45': 1.2,
        '46-60': 2.5,
        '61-80': 4.5,
      },
      female: {
        '18-30': 0.7,
        '31-45': 1.0,
        '46-60': 2.0,
        '61-80': 3.5,
      },
    };

    const ageGroup = this.getAgeGroup(age);

    if (gender in rates) {
      return rates[gender][ageGroup];
    }

    return rates.male[ageGroup];
  }

  private getAgeGroup(age: number): AgeGroup {
    if (age >= 31 && age <= 45) return '31-45';
    if (age >= 46 && age <= 60) return '46-60';
    if (age >= 61) return '61-80';
    return '18-30';
  }

  private getHealthMultiplier(
    healthConditions: string[],
    smokingStatus: SmokingStatus,
  ): number {
    let multiplier = 1.0;

    switch (smokingStatus) {
      case 'smoker':
        multiplier *= 2.0;
        break;
      case 'former-smoker':
        multiplier *= 1.3;
        break;
      case 'non-smoker':
      default:
        break;
    }

    const riskConditions = [
      'diabetes',
      'heart-disease',
      'cancer-history',
      'high-blood-pressure',
    ];

    const riskCount = healthConditions.filter((condition) =>
      riskConditions.includes(condition.toLowerCase()),
    ).length;

    multiplier *= 1 + riskCount * 0.5;

    return multiplier;
  }

  private getRiskClass(
    age: number,
    smokingStatus: SmokingStatus,
    healthConditions: string[],
  ): RiskClass {
    if (smokingStatus === 'smoker' || healthConditions.length > 2) {
      return 'HIGH';
    }

    if (age > 55 || healthConditions.length > 0) {
      return 'STANDARD';
    }

    return 'PREFERRED';
  }
}
