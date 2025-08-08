// src/lib/apollo.ts
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URI || 'http://localhost:3000/graphql',
});

// Server-side Apollo Client for RSC (React Server Components)
export const getClient = () => {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: httpLink,
    // Important: disable cache for server-side to avoid stale data
    ssrMode: typeof window === 'undefined',
    defaultOptions: {
      watchQuery: {
        errorPolicy: 'all',
      },
      query: {
        errorPolicy: 'all',
      },
    },
  });
};

// Client-side Apollo Client
export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});

// src/types/quote.ts
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