import { gql } from '@apollo/client';

export const GET_QUOTE = gql`
  query GetQuote($quoteId: String!) {
    getQuote(quoteId: $quoteId) {
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

// Test query for connection
export const TEST_CONNECTION = gql`
  query TestConnection {
    __schema {
      types {
        name
      }
    }
  }
`;