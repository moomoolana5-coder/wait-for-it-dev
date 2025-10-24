import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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

export const useNewListings = () => {
  return useQuery({
    queryKey: ['new-listings'],
    queryFn: async () => {
      // Fetch token addresses from database (only those within 24 hours)
      const { data: newTokens, error } = await supabase
        .from('new_listing_tokens')
        .select('token_address')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching new listing tokens:', error);
        throw error;
      }
      
      if (!newTokens || newTokens.length === 0) {
        console.log('No new listing tokens found in database');
        return [];
      }

      console.log('Found new listing tokens in DB:', newTokens);

      // Fetch each token individually to get more reliable data
      const pulsechainPairs: DexPair[] = [];
      
      for (const token of newTokens) {
        try {
          const response = await fetch(`${DEXSCREENER_API}/search?q=${token.token_address}`);
          if (!response.ok) {
            console.warn(`Failed to fetch token ${token.token_address}`);
            continue;
          }
          
          const data = await response.json();
          
          if (data.pairs && data.pairs.length > 0) {
            // Find the best PulseChain pair for this token
            const pulsechainTokenPairs = data.pairs.filter(
              (pair: DexPair) => pair.chainId === 'pulsechain'
            );
            
            if (pulsechainTokenPairs.length > 0) {
              // Sort by liquidity and take the best one
              pulsechainTokenPairs.sort((a: DexPair, b: DexPair) => 
                (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0)
              );
              pulsechainPairs.push(pulsechainTokenPairs[0]);
            }
          }
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (err) {
          console.error(`Error fetching data for token ${token.token_address}:`, err);
        }
      }
      
      console.log('Successfully fetched pairs:', pulsechainPairs.length);
      return pulsechainPairs;
    },
    refetchInterval: 60000,
    staleTime: 30000,
  });
};
