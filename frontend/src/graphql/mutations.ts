import { gql } from '@apollo/client';

export const CALCULATE_QUOTE = gql`
  mutation CalculateQuote($input: QuoteInputDto!) {
    calculateQuote(input: $input) {
      quoteId
      monthlyPremium
      annualPremium
      coverageAmount
      riskClass
      expiresAt
      createdAt
    }
  }
`;