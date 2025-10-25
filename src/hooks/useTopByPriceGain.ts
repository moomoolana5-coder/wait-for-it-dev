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

// Import featured tokens
import { FEATURED_TOKENS } from './useDexScreener';

export const useTopByPriceGain = () => {
  return useQuery({
    queryKey: ['top-by-price-gain', FEATURED_TOKENS.length],
    queryFn: async () => {
      const addressesLower = FEATURED_TOKENS.map((a) => a.toLowerCase());
      const wanted = new Set(addressesLower);

      // Try the /tokens endpoint for all addresses at once
      // Batch fetch to avoid URL limits and rate limiting
      const BATCH_SIZE = 20;
      const pairs: DexPair[] = [];
      for (let i = 0; i < addressesLower.length; i += BATCH_SIZE) {
        const batch = addressesLower.slice(i, i + BATCH_SIZE);
        const response = await fetch(`${DEXSCREENER_API}/tokens/${batch.join(',')}`);
        if (!response.ok) {
          console.warn(`useTopByPriceGain: batch ${i / BATCH_SIZE + 1} failed with status ${response.status}`);
          continue;
        }
        const data = await response.json();
        if (data.pairs) pairs.push(...(data.pairs as DexPair[]));
        // tiny delay to be polite with API
        await new Promise((r) => setTimeout(r, 200));
      }

      console.log(`TopByPriceGain: fetched ${pairs.length} pairs from ${addressesLower.length} addresses (batched)`);
      // CRITICAL: Only include tokens that are EXACTLY in our wanted list
      const bestByAddress = new Map<string, DexPair>();
      for (const p of pairs) {
        if (p.chainId !== 'pulsechain') continue;
        if (p.liquidity?.usd < 1000) continue;
        
        const base = p.baseToken.address.toLowerCase();
        const quote = p.quoteToken.address.toLowerCase();
        
        // ONLY match if the base token is in our wanted list
        if (!wanted.has(base)) continue;
        
        const current = bestByAddress.get(base);
        if (!current || (p.liquidity?.usd || 0) > (current.liquidity?.usd || 0)) {
          bestByAddress.set(base, p);
        }
      }

      // Fallback via /search for those still missing
      const missing = addressesLower.filter((addr) => !bestByAddress.has(addr));
      if (missing.length) {
        await Promise.all(
          missing.map(async (addr) => {
            try {
              const rs = await fetch(`${DEXSCREENER_API}/search?q=${addr}`);
              if (!rs.ok) return null;
              const ds = await rs.json();
              const found: DexPair[] = (ds.pairs || []).filter(
                (p: DexPair) => {
                  const base = p.baseToken.address.toLowerCase();
                  return p.chainId === 'pulsechain' 
                    && base === addr  // ONLY exact match on base token
                    && p.liquidity?.usd > 1000;
                }
              );
              let best: DexPair | null = null;
              for (const p of found) {
                if (!best || (p.liquidity?.usd || 0) > (best.liquidity?.usd || 0)) best = p;
              }
              if (best) bestByAddress.set(addr, best);
              return null;
            } catch {
              return null;
            }
          })
        );
      }

      // Sort by price change (descending) and return top 3
      const allPairs = Array.from(bestByAddress.values());
      
      const withPriceChange = allPairs.filter(p => p.priceChange?.h24 !== undefined);
      const positiveGainers = withPriceChange.filter(p => (p.priceChange?.h24 || 0) > 0);
      
      // Determine list to sort with safe fallbacks
      const toSort = positiveGainers.length > 0
        ? positiveGainers
        : (withPriceChange.length > 0 ? withPriceChange : allPairs);
      
      const sorted = toSort.sort((a, b) => (b.priceChange?.h24 || 0) - (a.priceChange?.h24 || 0));
      
      // Normalize data to ensure priceChange.h24 is always a number
      const top = sorted.slice(0, 3).map((p) => ({
        ...p,
        priceChange: { ...p.priceChange, h24: Number(p.priceChange?.h24 ?? 0) },
      }));
      
      return top;
    },
    refetchInterval: 60000,
    staleTime: 30000,
  });
};
