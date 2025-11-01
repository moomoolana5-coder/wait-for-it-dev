import { useQuery } from '@tanstack/react-query';
import { DexPair } from './useTickerTokens';
import { dexFetch } from '@/lib/dex';

const DEXSCREENER_API = 'https://api.dexscreener.com/latest/dex';

// Stablecoin addresses for ticker
const STABLECOIN_ADDRESSES = [
  '0x15D38573d2feeb82e7ad5187aB8c1D52810B1f07',
  '0x0dEEd1486bc52aA0d3E6f8849cEC5adD6598A162',
  '0xeB6b7932Da20c6D7B3a899D5887d86dfB09A6408',
  '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
];

export const useStablecoinTicker = () => {
  return useQuery({
    queryKey: ['stablecoin-ticker'],
    queryFn: async () => {
      const lower = STABLECOIN_ADDRESSES.map((a) => a.toLowerCase());
      const r = await dexFetch(`${DEXSCREENER_API}/tokens/${lower.join(',')}`);
      if (!r.ok) return [] as DexPair[];
      const d = await r.json();
      const pairs: DexPair[] = (d.pairs || []).filter((p: DexPair) => p.chainId === 'pulsechain');

      // Pick best pair per base token by liquidity
      const bestByBase = new Map<string, DexPair>();
      for (const p of pairs) {
        const base = p.baseToken.address.toLowerCase();
        if (!lower.includes(base)) continue;
        const current = bestByBase.get(base);
        if (!current || (p.liquidity?.usd || 0) > (current.liquidity?.usd || 0)) {
          bestByBase.set(base, p);
        }
      }

      const uniquePairs = Array.from(bestByBase.values());
      console.log(`Stablecoin ticker loaded: ${uniquePairs.length} tokens`);
      return uniquePairs;
    },
    refetchInterval: 120000,
    staleTime: 60000,
    refetchOnWindowFocus: false,
    retry: false,
  });
};
