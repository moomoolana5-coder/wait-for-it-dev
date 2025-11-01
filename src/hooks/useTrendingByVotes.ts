import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { dexFetch } from '@/lib/dex';

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

// Perbarui tipe data kembalian untuk menyertakan voteCount
type TrendingTokenPair = DexPair & { voteCount: number };

export const useTrendingByVotes = () => {
  return useQuery<TrendingTokenPair[], Error>({
    queryKey: ['trending-by-votes'],
    queryFn: async () => {
      // Perbaikan: Memastikan hanya mengambil vote > 0
      const { data: voteCounts, error } = await supabase
        .from('token_vote_counts')
        .select('token_address, total_votes')
        .gt('total_votes', 0) // <-- Filter Kunci
        .order('total_votes', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching vote counts:', error);
        throw error;
      }
      
      if (!voteCounts || voteCounts.length === 0) {
        console.log('No vote counts found');
        return [];
      }

      console.log('Vote counts:', voteCounts);

      // 2. Fetch data token dari Dexscreener dan lampirkan vote count yang benar.
      // Kami memetakan langsung voteCounts untuk menjamin kecocokan data.
      const tokenDataPromises = voteCounts.map(async (voteData) => {
        const address = voteData.token_address.toLowerCase();
        const voteCount = voteData.total_votes;

        try {
          // Try primary endpoint first
          const response = await dexFetch(`${DEXSCREENER_API}/tokens/${address}`);
          if (!response.ok) {
            // Try search endpoint as fallback
            const searchResponse = await dexFetch(`${DEXSCREENER_API}/search?q=${address}`);
            if (!searchResponse.ok) {
              return null;
            }
            const searchData = await searchResponse.json();
            const pulsechainPairs = (searchData.pairs || []).filter(
              (pair: DexPair) => 
                pair.chainId === 'pulsechain' &&
                pair.dexId === 'pulsex' &&
                pair.baseToken.address.toLowerCase() === address
            );
            
            if (pulsechainPairs.length === 0) {
              return null;
            }
            
            const bestPair = pulsechainPairs.sort((a: DexPair, b: DexPair) => 
              (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0)
            )[0];
            
            return {
              ...bestPair,
              voteCount: voteCount
            };
          }
          
          const data = await response.json();
          
          // Dapatkan pasangan terbaik (likuiditas tertinggi di PulseChain)
          // DAN pastikan baseToken.address cocok dengan address yang divote
          const pulsechainPairs = (data.pairs || []).filter(
            (pair: DexPair) => 
              pair.chainId === 'pulsechain' &&
              pair.dexId === 'pulsex' &&
              pair.baseToken.address.toLowerCase() === address
          );
          
          if (pulsechainPairs.length === 0) {
            return null;
          }
          
          const bestPair = pulsechainPairs.sort((a: DexPair, b: DexPair) => 
            (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0)
          )[0];
          
          return {
            ...bestPair,
            voteCount: voteCount
          };
        } catch (error) {
          // Silently handle errors to avoid console clutter
          return null;
        }
      });

      const tokenData = await Promise.all(tokenDataPromises);
      
      // 3. Saring hasil dan kembalikan pasangan yang valid (sudah terurut berdasarkan vote)
      const validPairs = tokenData
        .filter((pair): pair is TrendingTokenPair => pair !== null)
        .sort((a, b) => b.voteCount - a.voteCount); // Sortir ulang untuk kepastian

      console.log('Valid pairs with votes:', validPairs);
      
      return validPairs;
    },
    // Pengaturan React Query
    refetchInterval: 60000, // Refresh setiap 60 detik
    staleTime: 30000,      // Data dianggap segar selama 30 detik
  });
};