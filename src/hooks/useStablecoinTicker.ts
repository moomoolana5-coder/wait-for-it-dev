import { useQuery } from '@tanstack/react-query';
import { DexPair } from './useTickerTokens';

const DEXSCREENER_API = 'https://api.dexscreener.com/latest/dex';

// Stablecoin addresses for ticker
const STABLECOIN_ADDRESSES = [
  '0x15D38573d2feeb82e7ad5187aB8c1D52810B1f07',
  '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  '0x0dEEd1486bc52aA0d3E6f8849cEC5adD6598A162',
  '0xeB6b7932Da20c6D7B3a899D5887d86dfB09A6408',
  '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
];

export const useStablecoinTicker = () => {
  return useQuery({
    queryKey: ['stablecoin-ticker'],
    queryFn: async () => {
      const pairsByAddress = new Map<string, DexPair>();

      // Fetch all stablecoin tokens
      await Promise.all(STABLECOIN_ADDRESSES.map(async (addr) => {
        try {
          const r = await fetch(`${DEXSCREENER_API}/search?q=${addr.toLowerCase()}`);
          if (!r.ok) return;
          const d = await r.json();
          const pairs: DexPair[] = (d.pairs || []).filter((p: DexPair) => p.chainId === 'pulsechain');

          // Find best pair for this address
          let best: DexPair | null = null;
          for (const p of pairs) {
            const base = p.baseToken.address.toLowerCase();
            if (base !== addr.toLowerCase()) continue;
            if (!best || (p.liquidity?.usd || 0) > (best.liquidity?.usd || 0)) best = p;
          }
          if (best) pairsByAddress.set(best.pairAddress, best);
        } catch (err) {
          console.warn(`Failed to fetch stablecoin ${addr}:`, err);
        }
      }));

      const uniquePairs = Array.from(pairsByAddress.values());
      console.log(`Stablecoin ticker loaded: ${uniquePairs.length} tokens`);
      return uniquePairs;
    },
    refetchInterval: 45000,
    staleTime: 22500,
    refetchOnWindowFocus: false,
  });
};
