export interface QuoteInput {
  age: number;
  gender: 'male' | 'female';
  coverageAmount: number;
  healthConditions: string[];
  smokingStatus: 'non-smoker' | 'smoker' | 'former-smoker';
}

export interface QuoteResponse {
  quoteId: string;
  monthlyPremium: number;
  annualPremium: number;
  coverageAmount: number;
  riskClass: 'PREFERRED' | 'STANDARD' | 'HIGH';
  expiresAt: string;
  createdAt: string;
}