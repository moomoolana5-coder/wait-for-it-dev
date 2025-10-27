import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FEATURED_TOKENS } from './useDexScreener';

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

// Get all platform token addresses
const getPlatformTokenAddresses = async (): Promise<string[]> => {
  const addresses = new Set<string>();

  // Add featured tokens (primary source)
  FEATURED_TOKENS.forEach(addr => addresses.add(addr.toLowerCase()));

  // Try to add new listing tokens (optional)
  try {
    const { data: newListings } = await supabase
      .from('new_listing_tokens')
      .select('token_address')
      .order('created_at', { ascending: false });

    if (newListings) {
      newListings.forEach(token => addresses.add(token.token_address.toLowerCase()));
    }
  } catch (error) {
    console.log('New listing tokens not available');
  }

  // Try to add voted tokens (optional)
  try {
    const { data: votedTokens } = await supabase
      .from('token_vote_counts')
      .select('token_address')
      .gt('vote_count', 0);

    if (votedTokens) {
      votedTokens.forEach(token => addresses.add(token.token_address.toLowerCase()));
    }
  } catch (error) {
    console.log('Voted tokens not available');
  }

  return Array.from(addresses);
};

export const useAllPlatformTokens = () => {
  return useQuery({
    queryKey: ['all-platform-tokens'],
    queryFn: async () => {
      const platformAddresses = await getPlatformTokenAddresses();
      console.log(`🔄 Loading ${platformAddresses.length} platform tokens for ticker...`);

      const BATCH_SIZE = 30;
      const DELAY_MS = 400;
      const bestByAddress = new Map<string, DexPair>();
      const platformSet = new Set(platformAddresses);

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
          if (!response.ok) {
            console.warn(`⚠️ Batch ${batchIndex + 1}/${batches.length} failed with status ${response.status}`);
            continue;
          }

          const data = await response.json();
          const pairs: DexPair[] = (data.pairs || []);

          for (const p of pairs) {
            if (p.chainId !== 'pulsechain') continue;
            if (p.dexId !== 'pulsex') continue;
            const base = p.baseToken.address.toLowerCase();
            if (!platformSet.has(base)) continue;

            const current = bestByAddress.get(base);
            if (!current || (p.liquidity?.usd || 0) > (current.liquidity?.usd || 0)) {
              bestByAddress.set(base, p);
            }
          }

          console.log(`✓ Batch ${batchIndex + 1}/${batches.length} done - ${bestByAddress.size}/${platformAddresses.length} tokens loaded`);
        } catch (error) {
          console.error(`❌ Error in batch ${batchIndex + 1}/${batches.length}:`, error);
        }
      }

      const missing = platformAddresses.filter(addr => !bestByAddress.has(addr));
      if (missing.length > 0) {
        console.log(`🔍 Fetching ${missing.length} missing tokens individually...`);

        for (let i = 0; i < missing.length; i++) {
          const addr = missing[i];

          try {
            if (i > 0 && i % 3 === 0) {
              await new Promise(resolve => setTimeout(resolve, 300));
            }

            const response = await fetch(`${DEXSCREENER_API}/tokens/${addr}`);
            if (!response.ok) continue;

            const data = await response.json();
            const pairs: DexPair[] = (data.pairs || []).filter(
              (p: DexPair) => p.chainId === 'pulsechain' && p.dexId === 'pulsex'
            );

            if (pairs.length > 0) {
              const best = pairs.reduce((prev, curr) =>
                (curr.liquidity?.usd || 0) > (prev.liquidity?.usd || 0) ? curr : prev
              );
              bestByAddress.set(addr, best);
              console.log(`  ✓ Found ${best.baseToken.symbol} (${i + 1}/${missing.length})`);
            }
          } catch (error) {
            console.warn(`  ⚠️ Failed ${addr}:`, error);
          }
        }
      }

      const tokens = Array.from(bestByAddress.values());
      console.log(`✅ Successfully loaded ${tokens.length}/${platformAddresses.length} platform tokens`);

      if (tokens.length < platformAddresses.length) {
        const loadedAddresses = new Set(tokens.map(t => t.baseToken.address.toLowerCase()));
        const notLoaded = platformAddresses.filter(addr => !loadedAddresses.has(addr));
        console.log(`⚠️ Failed to load ${notLoaded.length} tokens:`, notLoaded.slice(0, 5));
      }

      return tokens;
    },
    refetchInterval: 120000,
    staleTime: 60000,
  });
};
