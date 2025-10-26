import { useQuery } from '@tanstack/react-query';

interface TokenInfo {
  imageUrl?: string;
  websites?: { url: string }[];
  socials?: { type: string; url: string }[];
}

interface Token {
  address: string;
  name: string;
  symbol: string;
}

interface DexPair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: Token;
  quoteToken: Token;
  priceNative: string;
  priceUsd: string;
  txns: {
    h24: {
      buys: number;
      sells: number;
    };
  };
  volume: {
    h24: number;
  };
  priceChange: {
    h24: number;
  };
  liquidity: {
    usd: number;
  };
  fdv?: number;
  marketCap?: number;
  pairCreatedAt: number;
  info?: TokenInfo;
}

const DEXSCREENER_API = 'https://api.dexscreener.com/latest/dex';

export const useTopTokens = () => {
  return useQuery({
    queryKey: ['top-tokens'],
    queryFn: async () => {
      const response = await fetch(`${DEXSCREENER_API}/pairs/pulsechain`);
      if (!response.ok) {
        throw new Error('Failed to fetch tokens');
      }
      const data = await response.json();

      const pulsechainPairs = data.pairs.filter(
        (pair: DexPair) => pair.chainId === 'pulsechain' && pair.dexId === 'pulsex'
      );

      const sortedByPerformance = pulsechainPairs.sort((a: DexPair, b: DexPair) => {
        const scoreA = (a.volume?.h24 || 0) * 0.5 + Math.abs(a.priceChange?.h24 || 0) * 0.5;
        const scoreB = (b.volume?.h24 || 0) * 0.5 + Math.abs(b.priceChange?.h24 || 0) * 0.5;
        return scoreB - scoreA;
      });

      return sortedByPerformance.slice(0, 30);
    },
    refetchInterval: 60000,
    staleTime: 30000,
  });
};
