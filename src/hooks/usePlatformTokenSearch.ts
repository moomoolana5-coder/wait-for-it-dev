import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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

// Get GIGACOCK token addresses only
const getGigacockTokenAddresses = async (): Promise<string[]> => {
  return Array.from(GIGACOCK_TOKEN_SET);
};

const MAX_RESULTS = 50;

export const usePlatformTokenSearch = (query: string) => {
  return useQuery({
    queryKey: ['gigacock-token-search', query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];
      
      // Get GIGACOCK token addresses only
      const gigacockAddresses = await getGigacockTokenAddresses();
      
      console.log(`Searching in ${gigacockAddresses.length} GIGACOCK tokens for: "${query}"`);
      
      const queryLower = query.toLowerCase().trim();
      const isContractAddress = /^0x[a-fA-F0-9]{40}$/.test(query);
      
      // Fetch data for all GIGACOCK tokens
      const BATCH_SIZE = 30;
      const batches: string[][] = [];
      
      for (let i = 0; i < gigacockAddresses.length; i += BATCH_SIZE) {
        batches.push(gigacockAddresses.slice(i, i + BATCH_SIZE));
      }
      
      let allPairs: DexPair[] = [];
      
      for (const batch of batches) {
        try {
          const response = await fetch(`${DEXSCREENER_API}/tokens/${batch.join(',')}`);
          if (!response.ok) continue;
          
          const data = await response.json();
          const pairs = (data.pairs || []).filter((pair: DexPair) => {
            if (pair.chainId !== 'pulsechain') return false;
            if (pair.dexId !== 'pulsex') return false;
            
            const baseAddr = pair.baseToken.address.toLowerCase();
            // Must be in GIGACOCK whitelist
            if (!GIGACOCK_TOKEN_SET.has(baseAddr)) return false;
            
            return true;
          });
          
          allPairs = [...allPairs, ...pairs];
          
          // Small delay between batches
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error('Error fetching GIGACOCK batch:', error);
        }
      }
      
      // Remove duplicates by pairAddress, keep highest liquidity
      const pairMap = new Map<string, DexPair>();
      allPairs.forEach(pair => {
        const existing = pairMap.get(pair.baseToken.address.toLowerCase());
        if (!existing || (pair.liquidity?.usd || 0) > (existing.liquidity?.usd || 0)) {
          pairMap.set(pair.baseToken.address.toLowerCase(), pair);
        }
      });
      
      let filteredPairs = Array.from(pairMap.values());
      
      // Filter by search query
      if (isContractAddress) {
        // Exact contract address search (case-insensitive)
        const exactMatch = filteredPairs.find(
          pair => pair.baseToken.address.toLowerCase() === queryLower
        );
        filteredPairs = exactMatch ? [exactMatch] : [];
      } else {
        // Substring search on name or symbol
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
  });
};
