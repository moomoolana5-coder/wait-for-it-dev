import { useQuery } from '@tanstack/react-query';
import { dexFetch } from '@/lib/dex';
import { FEATURED_TOKENS } from '@/hooks/useDexScreener';

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

export interface DexPair {
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

export interface TickerConfig {
  maxItems?: number;
  pollingIntervalMs?: number;
  sortByLiquidity?: boolean;
}

// Comprehensive ticker loader with pagination & deduplication
export const useTickerTokens = (config: TickerConfig = {}) => {
  const { maxItems = 200, pollingIntervalMs = 45000, sortByLiquidity = true } = config;

  return useQuery({
    queryKey: ['ticker-tokens', FEATURED_TOKENS.length, maxItems],
    queryFn: async () => {
      const addresses = FEATURED_TOKENS.map(a => a.toLowerCase());
      const pairsByAddress = new Map<string, DexPair>();

      // Fetch ALL featured tokens in batches
      const BATCH = 8;
      for (let i = 0; i < addresses.length; i += BATCH) {
        const slice = addresses.slice(i, i + BATCH);
        await Promise.all(slice.map(async (addr) => {
          try {
            const r = await dexFetch(`${DEXSCREENER_API}/search?q=${addr}`);
            if (!r.ok) return;
            const d = await r.json();
            const pairs: DexPair[] = (d.pairs || []).filter((p: DexPair) => p.chainId === 'pulsechain');

            // Find best pair for this address
            let best: DexPair | null = null;
            for (const p of pairs) {
              const base = p.baseToken.address.toLowerCase();
              if (base !== addr) continue;
              if (!best || (p.liquidity?.usd || 0) > (best.liquidity?.usd || 0)) best = p;
            }
            if (best) pairsByAddress.set(best.pairAddress, best);
          } catch (err) {
            console.warn(`Failed to fetch token ${addr}:`, err);
          }
        }));
        await new Promise(res => setTimeout(res, 200));
      }

      // Get latest pairs from PulseChain to fill up to maxItems
      try {
        const latestRes = await dexFetch(`${DEXSCREENER_API}/pairs/pulsechain`);
        if (latestRes.ok) {
          const latestData = await latestRes.json();
          const latestPairs: DexPair[] = latestData.pairs || [];
          
          for (const pair of latestPairs) {
            if (pairsByAddress.size >= maxItems) break;
            if (!pairsByAddress.has(pair.pairAddress)) {
              pairsByAddress.set(pair.pairAddress, pair);
            }
          }
        }
      } catch (err) {
        console.warn('Failed to fetch latest pairs:', err);
      }

      // Convert to array and deduplicate
      let uniquePairs = Array.from(pairsByAddress.values());

      // Sort by liquidity if enabled
      if (sortByLiquidity) {
        uniquePairs.sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0));
      }

      // Limit to maxItems
      uniquePairs = uniquePairs.slice(0, maxItems);

      console.log(`Ticker loaded: ${uniquePairs.length} unique tokens`);
      return uniquePairs;
    },
    refetchInterval: pollingIntervalMs,
    staleTime: pollingIntervalMs / 2,
    refetchOnWindowFocus: false,
  });
};
