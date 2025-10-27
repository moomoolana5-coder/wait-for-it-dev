import { useQuery } from '@tanstack/react-query';
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

// Robust ticker loader: always resolves each address via /search to ensure coverage
export const useTickerTokens = () => {
  return useQuery({
    queryKey: ['ticker-tokens', FEATURED_TOKENS.length],
    queryFn: async () => {
      const addresses = FEATURED_TOKENS.map(a => a.toLowerCase());
      const bestByAddress = new Map<string, DexPair>();

      // Fetch in small batches to avoid rate limits
      const BATCH = 6;
      for (let i = 0; i < addresses.length; i += BATCH) {
        const slice = addresses.slice(i, i + BATCH);
        await Promise.all(slice.map(async (addr) => {
          try {
            const r = await fetch(`${DEXSCREENER_API}/search?q=${addr}`);
            if (!r.ok) return;
            const d = await r.json();
            const pairs: DexPair[] = (d.pairs || []).filter((p: DexPair) => p.chainId === 'pulsechain');

            let best: DexPair | null = null;
            for (const p of pairs) {
              const base = p.baseToken.address.toLowerCase();
              if (base !== addr) continue;
              if (!best || (p.liquidity?.usd || 0) > (best.liquidity?.usd || 0)) best = p;
            }
            if (best) bestByAddress.set(addr, best);
          } catch {}
        }));
        // Small spacing between batches
        await new Promise(res => setTimeout(res, 250));
      }

      // Preserve FEATURED_TOKENS order
      const ordered = addresses.map(a => bestByAddress.get(a)).filter(Boolean) as DexPair[];
      console.log(`Ticker tokens loaded: ${ordered.length}/${addresses.length}`);
      return ordered;
    },
    refetchInterval: 120000,
    staleTime: 60000,
  });
};
