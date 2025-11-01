import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { dexFetch } from '@/lib/dex';
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
  
  // Add featured tokens
  FEATURED_TOKENS.forEach(addr => addresses.add(addr.toLowerCase()));
  
  // Add new listing tokens
  const { data: newListings } = await supabase
    .from('new_listing_tokens')
    .select('token_address')
    .order('created_at', { ascending: false });
  
  if (newListings) {
    newListings.forEach(token => addresses.add(token.token_address.toLowerCase()));
  }
  
  // Add voted tokens
  const { data: votedTokens } = await supabase
    .from('token_vote_counts')
    .select('token_address')
    .gt('vote_count', 0);
  
  if (votedTokens) {
    votedTokens.forEach(token => addresses.add(token.token_address.toLowerCase()));
  }
  
  return Array.from(addresses);
};

export const useAllPlatformTokens = () => {
  return useQuery({
    queryKey: ['all-platform-tokens'],
    queryFn: async () => {
      const platformAddresses = await getPlatformTokenAddresses();
      console.log(`Loading ${platformAddresses.length} platform tokens...`);
      
      const BATCH_SIZE = 20;
      const DELAY_MS = 500;
      const bestByAddress = new Map<string, DexPair>();

      const batches: string[][] = [];
      for (let i = 0; i < platformAddresses.length; i += BATCH_SIZE) {
        batches.push(platformAddresses.slice(i, i + BATCH_SIZE));
      }

      // Process batches
      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        
        try {
          if (batchIndex > 0) {
            await new Promise(resolve => setTimeout(resolve, DELAY_MS));
          }

          const response = await dexFetch(`${DEXSCREENER_API}/tokens/${batch.join(',')}`);
          if (!response.ok) {
            console.warn(`Batch ${batchIndex + 1} failed: HTTP ${response.status}`);
            continue;
          }

          const data = await response.json();
          const pairs: DexPair[] = (data.pairs || []);

          for (const p of pairs) {
            if (p.chainId !== 'pulsechain') continue;
            const base = p.baseToken.address.toLowerCase();
            if (!platformAddresses.includes(base)) continue;
            
            const current = bestByAddress.get(base);
            if (!current || (p.liquidity?.usd || 0) > (current.liquidity?.usd || 0)) {
              bestByAddress.set(base, p);
            }
          }

          console.log(`Batch ${batchIndex + 1}/${batches.length} (${bestByAddress.size} tokens)`);
        } catch (error) {
          console.error(`Error in batch ${batchIndex + 1}:`, error);
        }
      }

      // Fallback: search for missing tokens individually
      const missing = platformAddresses.filter(addr => !bestByAddress.has(addr));
      if (missing.length > 0) {
        console.log(`Fetching ${missing.length} missing tokens...`);
        
        for (let i = 0; i < missing.length; i++) {
          const addr = missing[i];
          
          try {
            if (i > 0 && i % 5 === 0) {
              await new Promise(resolve => setTimeout(resolve, 300));
            }

            const rs = await dexFetch(`${DEXSCREENER_API}/search?q=${addr}`);
            if (!rs.ok) continue;
            const ds = await rs.json();
            const found: DexPair[] = (ds.pairs || []).filter((p: DexPair) => 
              p.chainId === 'pulsechain'
            );
            
            let best: DexPair | null = null;
            for (const p of found) {
              const base = p.baseToken.address.toLowerCase();
              if (base !== addr) continue;
              if (!best || (p.liquidity?.usd || 0) > (best.liquidity?.usd || 0)) best = p;
            }
            if (best) bestByAddress.set(addr, best);
          } catch (error) {
            console.warn(`Failed to fetch ${addr}:`, error);
          }
        }
      }

      const tokens = Array.from(bestByAddress.values());
      console.log(`✅ Loaded ${tokens.length}/${platformAddresses.length} platform tokens`);
      return tokens;
    },
    refetchInterval: 120000,
    staleTime: 60000,
  });
};
