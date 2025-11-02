import { useQuery } from '@tanstack/react-query';
import { dexFetch } from '@/lib/dex';

const DEXSCREENER_API = 'https://api.dexscreener.com/latest/dex';
const GIGACOCK_ADDRESS = '0x818ec0672F65B634F94F234aC132678009064CdF';

export const useGigacockPrice = () => {
  return useQuery({
    queryKey: ['gigacock-price'],
    queryFn: async () => {
      const r = await dexFetch(`${DEXSCREENER_API}/tokens/${GIGACOCK_ADDRESS}`);
      if (!r.ok) return null;
      const d = await r.json();
      const pairs = d.pairs || [];
      
      // Find best pair by liquidity on PulseChain
      const pulsePairs = pairs.filter((p: any) => p.chainId === 'pulsechain');
      if (pulsePairs.length === 0) return null;
      
      const bestPair = pulsePairs.reduce((best: any, current: any) => {
        const bestLiq = best.liquidity?.usd || 0;
        const currentLiq = current.liquidity?.usd || 0;
        return currentLiq > bestLiq ? current : best;
      }, pulsePairs[0]);
      
      return {
        priceUsd: parseFloat(bestPair.priceUsd || '0'),
        priceChange24h: bestPair.priceChange?.h24 || 0,
      };
    },
    refetchInterval: 30000, // 30 seconds
    staleTime: 15000,
    refetchOnWindowFocus: false,
  });
};
