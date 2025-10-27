import { useQuery } from '@tanstack/react-query';
import { FEATURED_TOKENS } from './useDexScreener';

// GIGACOCK ecosystem token whitelist
const GIGACOCK_TOKEN_SET = new Set(
  FEATURED_TOKENS.map(addr => addr.toLowerCase())
);

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

const MAX_RESULTS = 50;

export const usePlatformTokenSearch = (query: string) => {
  return useQuery({
    queryKey: ['gigacock-token-search', query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];
      
      const queryLower = query.toLowerCase().trim();
      const isContractAddress = /^0x[a-fA-F0-9]{40}$/.test(query);
      
      console.log(`Searching DexScreener for: "${query}"`);
      
      let allPairs: DexPair[] = [];
      
      try {
        // Use DexScreener search API
        const response = await fetch(`${DEXSCREENER_API}/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) {
          console.error('DexScreener search failed:', response.status);
          return [];
        }
        
        const data = await response.json();
        const pairs = (data.pairs || []).filter((pair: DexPair) => {
          // Only PulseChain + PulseX
          if (pair.chainId !== 'pulsechain') return false;
          if (pair.dexId !== 'pulsex') return false;
          
          const baseAddr = pair.baseToken.address.toLowerCase();
          // CRITICAL: Must be in GIGACOCK whitelist
          if (!GIGACOCK_TOKEN_SET.has(baseAddr)) return false;
          
          return true;
        });
        
        allPairs = pairs;
        console.log(`Found ${allPairs.length} GIGACOCK tokens matching "${query}"`);
        
      } catch (error) {
        console.error('Error searching tokens:', error);
        return [];
      }
      
      // Remove duplicates by baseToken address, keep highest liquidity
      const pairMap = new Map<string, DexPair>();
      allPairs.forEach(pair => {
        const baseAddr = pair.baseToken.address.toLowerCase();
        const existing = pairMap.get(baseAddr);
        if (!existing || (pair.liquidity?.usd || 0) > (existing.liquidity?.usd || 0)) {
          pairMap.set(baseAddr, pair);
        }
      });
      
      let filteredPairs = Array.from(pairMap.values());
      
      // Additional client-side filtering for precision
      if (isContractAddress) {
        // Exact contract address match
        const exactMatch = filteredPairs.find(
          pair => pair.baseToken.address.toLowerCase() === queryLower
        );
        filteredPairs = exactMatch ? [exactMatch] : [];
      } else {
        // Substring search on name or symbol (already filtered by API, but double-check)
        filteredPairs = filteredPairs.filter(pair => {
          const symbol = pair.baseToken.symbol.toLowerCase();
          const name = pair.baseToken.name.toLowerCase();
          return symbol.includes(queryLower) || name.includes(queryLower);
        });
      }
      
      // Sort: exact address match first, then by liquidity
      filteredPairs.sort((a, b) => {
        if (isContractAddress) {
          const aMatch = a.baseToken.address.toLowerCase() === queryLower;
          const bMatch = b.baseToken.address.toLowerCase() === queryLower;
          if (aMatch && !bMatch) return -1;
          if (!aMatch && bMatch) return 1;
        }
        return (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0);
      });
      
      // Limit results
      return filteredPairs.slice(0, MAX_RESULTS);
    },
    enabled: query.length >= 2,
    staleTime: 30000, // Cache for 30s
    retry: 1, // Only retry once on failure
  });
};
