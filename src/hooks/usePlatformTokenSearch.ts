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

// Get all platform token addresses (featured + new listings + voted)
const getPlatformTokenAddresses = async (): Promise<string[]> => {
  const addresses = new Set<string>();
  
  // Add featured tokens
  FEATURED_TOKENS.forEach(addr => addresses.add(addr.toLowerCase()));
  
  // Add new listing tokens from database
  const { data: newListings } = await supabase
    .from('new_listing_tokens')
    .select('token_address')
    .order('created_at', { ascending: false });
  
  if (newListings) {
    newListings.forEach(token => addresses.add(token.token_address.toLowerCase()));
  }
  
  // Add voted tokens from database
  const { data: votedTokens } = await supabase
    .from('token_vote_counts')
    .select('token_address')
    .gt('vote_count', 0);
  
  if (votedTokens) {
    votedTokens.forEach(token => addresses.add(token.token_address.toLowerCase()));
  }
  
  return Array.from(addresses);
};

export const usePlatformTokenSearch = (query: string) => {
  return useQuery({
    queryKey: ['platform-token-search', query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];
      
      // Get all platform token addresses
      const platformAddresses = await getPlatformTokenAddresses();
      
      console.log(`Searching in ${platformAddresses.length} platform tokens for: "${query}"`);
      
      const queryLower = query.toLowerCase();
      const isAddress = queryLower.startsWith('0x') && queryLower.length >= 10;
      
      if (isAddress) {
        // If searching by address, only check if it exists in platform
        const matchedAddress = platformAddresses.find(addr => 
          addr.toLowerCase().includes(queryLower)
        );
        
        if (!matchedAddress) {
          console.log('Address not found in platform tokens');
          return [];
        }
        
        // Fetch data for this address
        const response = await fetch(`${DEXSCREENER_API}/tokens/${matchedAddress}`);
        if (!response.ok) return [];
        
        const data = await response.json();
        const pairs = (data.pairs || []).filter((pair: DexPair) => 
          pair.chainId === 'pulsechain' &&
          pair.baseToken.address.toLowerCase() === matchedAddress
        );
        
        return pairs;
      } else {
        // Search by name/symbol - fetch data for all platform tokens and filter
        // Use batch processing to avoid rate limits
        const BATCH_SIZE = 30;
        const batches: string[][] = [];
        
        for (let i = 0; i < platformAddresses.length; i += BATCH_SIZE) {
          batches.push(platformAddresses.slice(i, i + BATCH_SIZE));
        }
        
        let allPairs: DexPair[] = [];
        
        // Process first 3 batches only for search (90 tokens max for fast search)
        const batchesToProcess = batches.slice(0, 3);
        
        for (const batch of batchesToProcess) {
          try {
            const response = await fetch(`${DEXSCREENER_API}/tokens/${batch.join(',')}`);
            if (!response.ok) continue;
            
            const data = await response.json();
            const pairs = (data.pairs || []).filter((pair: DexPair) => {
              if (pair.chainId !== 'pulsechain') return false;
              
              const baseAddr = pair.baseToken.address.toLowerCase();
              if (!platformAddresses.includes(baseAddr)) return false;
              
              const symbol = pair.baseToken.symbol.toLowerCase();
              const name = pair.baseToken.name.toLowerCase();
              
              return symbol.includes(queryLower) || name.includes(queryLower);
            });
            
            allPairs = [...allPairs, ...pairs];
            
            // Small delay between batches
            await new Promise(resolve => setTimeout(resolve, 200));
          } catch (error) {
            console.error('Error fetching batch:', error);
          }
        }
        
        // Remove duplicates by pairAddress
        const uniquePairs = Array.from(
          new Map(allPairs.map(pair => [pair.pairAddress, pair])).values()
        );
        
        // Sort by liquidity
        return uniquePairs.sort((a, b) => 
          (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0)
        );
      }
    },
    enabled: query.length >= 2,
    staleTime: 30000, // Cache for 30s
  });
};
