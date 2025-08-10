// backend/src/quote/quote.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { QuoteService } from './quote.service';
import { RedisService } from '../redis/redis.service';
import { QuoteInputDto } from './dto/quote-input.dto';

describe('QuoteService', () => {
  let service: QuoteService;

  const mockRedisService = {
    set: jest.fn(),
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuoteService,
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    service = module.get<QuoteService>(QuoteService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateQuote', () => {
    const baseInput: QuoteInputDto = {
      age: 35,
      gender: 'male',
      coverageAmount: 500000,
      healthConditions: ['none'],
      smokingStatus: 'non-smoker',
    };

    it('should calculate higher premium for smoker', async () => {
      const smokerInput = { ...baseInput, smokingStatus: 'smoker' as const };
      mockRedisService.set.mockResolvedValue(undefined);

      const result = await service.calculateQuote(smokerInput);

      expect(result.monthlyPremium).toBe(100.0);
      expect(result.annualPremium).toBe(1200.0);
      expect(result.riskClass).toBe('HIGH');
    });

    it('should calculate premium for former smoker', async () => {
      const formerSmokerInput = {
        ...baseInput,
        smokingStatus: 'former-smoker' as const,
      };
      mockRedisService.set.mockResolvedValue(undefined);

      const result = await service.calculateQuote(formerSmokerInput);

      expect(result.monthlyPremium).toBe(65.0); // 1.3x multiplier
      expect(result.annualPremium).toBe(780.0);
      expect(result.riskClass).toBe('STANDARD');
    });

    it('should use different base rates by age group', async () => {
      // Test young adult (18-30)
      const youngInput = { ...baseInput, age: 25 };
      mockRedisService.set.mockResolvedValue(undefined);

      const youngResult = await service.calculateQuote(youngInput);
      expect(youngResult.annualPremium).toBe(400.0); // 500000 * 0.8 / 1000

      // Test older adult (61-80)
      const olderInput = { ...baseInput, age: 65 };
      const olderResult = await service.calculateQuote(olderInput);
      expect(olderResult.annualPremium).toBe(2250.0); // 500000 * 4.5 / 1000
      expect(olderResult.riskClass).toBe('STANDARD'); // age > 55
    });

    it('should use different base rates by gender', async () => {
      // Test female rates (lower)
      const femaleInput = { ...baseInput, gender: 'female' as const };
      mockRedisService.set.mockResolvedValue(undefined);

      const femaleResult = await service.calculateQuote(femaleInput);
      expect(femaleResult.annualPremium).toBe(500.0); // 500000 * 1.0 / 1000 (female 31-45)

      // Male should be higher
      const maleResult = await service.calculateQuote(baseInput);
      expect(maleResult.annualPremium).toBe(600.0); // 500000 * 1.2 / 1000 (male 31-45)

      expect(maleResult.annualPremium).toBeGreaterThan(
        femaleResult.annualPremium,
      );
    });

    it('should round premiums to 2 decimal places', async () => {
      const input = { ...baseInput, coverageAmount: 333333 };
      mockRedisService.set.mockResolvedValue(undefined);

      const result = await service.calculateQuote(input);

      // Should not have floating point precision issues
      expect(result.monthlyPremium).toBe(33.33);
      expect(result.annualPremium).toBe(400.0);
    });

    it('should cache quote in Redis with 30-day expiration', async () => {
      mockRedisService.set.mockResolvedValue(undefined);

      const result = await service.calculateQuote(baseInput);

      expect(mockRedisService.set).toHaveBeenCalledWith(
        `quote:${result.quoteId}`,
        JSON.stringify(result),
        30 * 24 * 60 * 60, // 30 days in seconds
      );
    });

    it('should set expiration date 30 days from now', async () => {
      mockRedisService.set.mockResolvedValue(undefined);
      const beforeTest = new Date();

      const result = await service.calculateQuote(baseInput);

      const expiresAt = new Date(result.expiresAt);
      const expectedExpiry = new Date(
        beforeTest.getTime() + 30 * 24 * 60 * 60 * 1000,
      );

      // Allow 1 second tolerance for test execution time
      expect(
        Math.abs(expiresAt.getTime() - expectedExpiry.getTime()),
      ).toBeLessThan(1000);
    });
  });

  describe('getQuote', () => {
    const mockQuote = {
      quoteId: 'test-uuid',
      monthlyPremium: 50.0,
      annualPremium: 600.0,
      coverageAmount: 500000,
      riskClass: 'PREFERRED',
      expiresAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    it('should retrieve quote from Redis cache', async () => {
      mockRedisService.get.mockResolvedValue(JSON.stringify(mockQuote));

      const result = await service.getQuote('test-uuid');

      expect(mockRedisService.get).toHaveBeenCalledWith('quote:test-uuid');
      expect(result).toEqual(mockQuote);
    });

    it('should return null when quote not found', async () => {
      mockRedisService.get.mockResolvedValue(null);

      const result = await service.getQuote('non-existent-uuid');

      expect(mockRedisService.get).toHaveBeenCalledWith(
        'quote:non-existent-uuid',
      );
      expect(result).toBeNull();
    });

    describe('risk classification logic', () => {
      beforeEach(() => {
        mockRedisService.set.mockResolvedValue(undefined);
      });

      it('should classify as STANDARD for older adults or health conditions', async () => {
        const olderInput: QuoteInputDto = {
          age: 60,
          gender: 'male',
          coverageAmount: 500000,
          healthConditions: ['none'],
          smokingStatus: 'non-smoker',
        };

        const healthInput: QuoteInputDto = {
          age: 30,
          gender: 'female',
          coverageAmount: 500000,
          healthConditions: ['diabetes'],
          smokingStatus: 'non-smoker',
        };

        const olderResult = await service.calculateQuote(olderInput);
        const healthResult = await service.calculateQuote(healthInput);

        expect(olderResult.riskClass).toBe('STANDARD');
        expect(healthResult.riskClass).toBe('STANDARD');
      });

      it('should classify as HIGH for smokers or multiple health conditions', async () => {
        const smokerInput: QuoteInputDto = {
          age: 30,
          gender: 'male',
          coverageAmount: 500000,
          healthConditions: ['none'],
          smokingStatus: 'smoker',
        };

        const multiHealthInput: QuoteInputDto = {
          age: 30,
          gender: 'female',
          coverageAmount: 500000,
          healthConditions: [
            'diabetes',
            'heart-disease',
            'high-blood-pressure',
          ],
          smokingStatus: 'non-smoker',
        };

        const smokerResult = await service.calculateQuote(smokerInput);
        const multiHealthResult =
          await service.calculateQuote(multiHealthInput);

        expect(smokerResult.riskClass).toBe('HIGH');
        expect(multiHealthResult.riskClass).toBe('HIGH');
      });
    });

    describe('edge cases', () => {
      beforeEach(() => {
        mockRedisService.set.mockResolvedValue(undefined);
      });

      it('should handle maximum coverage amount', async () => {
        const input: QuoteInputDto = {
          age: 45,
          gender: 'male',
          coverageAmount: 5000000,
          healthConditions: ['none'],
          smokingStatus: 'non-smoker',
        };

        const result = await service.calculateQuote(input);
        expect(result.coverageAmount).toBe(5000000);
        expect(result.monthlyPremium).toBe(500.0);
      });
    });
  });
});
