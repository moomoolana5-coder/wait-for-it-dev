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

import { supabase } from '@/integrations/supabase/client';
import { FEATURED_TOKENS } from './useDexScreener';

const getPlatformTokenAddresses = async (): Promise<string[]> => {
  const addresses = new Set<string>();

  FEATURED_TOKENS.forEach(addr => addresses.add(addr.toLowerCase()));

  const { data: newListings } = await supabase
    .from('new_listing_tokens')
    .select('token_address')
    .order('created_at', { ascending: false });

  if (newListings) {
    newListings.forEach(token => addresses.add(token.token_address.toLowerCase()));
  }

  const { data: votedTokens } = await supabase
    .from('token_vote_counts')
    .select('token_address')
    .gt('vote_count', 0);

  if (votedTokens) {
    votedTokens.forEach(token => addresses.add(token.token_address.toLowerCase()));
  }

  return Array.from(addresses);
};

export const useTopByVolume = () => {
  return useQuery({
    queryKey: ['top-by-volume'],
    queryFn: async () => {
      const platformAddresses = await getPlatformTokenAddresses();
      console.log(`Loading top by volume from ${platformAddresses.length} tokens...`);

      const BATCH_SIZE = 30;
      const DELAY_MS = 500;
      const bestByAddress = new Map<string, DexPair>();

      const batches: string[][] = [];
      for (let i = 0; i < platformAddresses.length; i += BATCH_SIZE) {
        batches.push(platformAddresses.slice(i, i + BATCH_SIZE));
      }

      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];

        try {
          if (batchIndex > 0) {
            await new Promise(resolve => setTimeout(resolve, DELAY_MS));
          }

          const response = await fetch(`${DEXSCREENER_API}/tokens/${batch.join(',')}`);
          if (!response.ok) continue;

          const data = await response.json();
          const pairs: DexPair[] = (data.pairs || []);

          for (const p of pairs) {
            if (p.chainId !== 'pulsechain') continue;
            if (p.dexId !== 'pulsex') continue;
            if (p.liquidity?.usd < 1000) continue;

            const base = p.baseToken.address.toLowerCase();
            if (!platformAddresses.includes(base)) continue;

            const current = bestByAddress.get(base);
            if (!current || (p.liquidity?.usd || 0) > (current.liquidity?.usd || 0)) {
              bestByAddress.set(base, p);
            }
          }
        } catch (error) {
          console.error(`Error in batch ${batchIndex + 1}:`, error);
        }
      }

      const tokens = Array.from(bestByAddress.values());

      const sorted = tokens.sort((a, b) => {
        const scoreA = a.volume.h24 * (1 + (a.priceChange?.h24 || 0) / 100);
        const scoreB = b.volume.h24 * (1 + (b.priceChange?.h24 || 0) / 100);
        return scoreB - scoreA;
      });

      console.log(`✅ Loaded ${sorted.length} top by volume tokens`);
      return sorted;
    },
    refetchInterval: 120000,
    staleTime: 60000,
  });
};
