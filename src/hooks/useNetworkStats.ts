import { useQuery } from '@tanstack/react-query';

interface NetworkStat {
  value: number;
  prevValue?: number;
  timestamp: Date;
}

interface NetworkStats {
  transactions: NetworkStat | null;
  dexVolume: NetworkStat | null;
}

const DEXSCREENER_API = 'https://api.dexscreener.com/latest/dex';

// Featured tokens to aggregate stats from
const FEATURED_TOKENS = [
  '0x2b591e99afE9f32eAA6214f7B7629768c40Eeb39', // HEX
  '0xA1077a294dDE1B09bB078844df40758a5D0f9a27', // WPLS
  '0x95B303987A60C71504D99Aa1b13B4DA07b0790ab', // PLSX
  '0x2fa878Ab3F87CC1C9737Fc071108F904c0B0C95d', // INC
  '0x4Eb7C1c05087f98Ae617d006F48914eE73fF8D2A', // XGAME
  '0x14aED785b3F951Eb5aC98250E8f4f530A2F83177', // GIGACOCK
  '0xec4252e62C6dE3D655cA9Ce3AfC12E553ebBA274', // PUMP
  '0x0392fBD58918E7ECBB2C68f4EBe4e2225C9a6468', // TRX
];

/**
 * Fetch pairs for multiple tokens in batches
 */
const fetchTokenPairs = async (addresses: string[]): Promise<any[]> => {
  const batchSize = 10;
  const allPairs: any[] = [];
  
  for (let i = 0; i < addresses.length; i += batchSize) {
    const batch = addresses.slice(i, i + batchSize);
    const promises = batch.map(async (address) => {
      try {
        const response = await fetch(`${DEXSCREENER_API}/search?q=${address}`);
        if (!response.ok) return [];
        const data = await response.json();
        return data.pairs?.filter((p: any) => p.chainId === 'pulsechain') || [];
      } catch {
        return [];
      }
    });
    
    const batchResults = await Promise.all(promises);
    allPairs.push(...batchResults.flat());
  }
  
  return allPairs;
};

/**
 * Fetch total DEX volume for PulseChain (24h)
 * Aggregates volume from featured token pairs
 */
const fetchDexVolume24h = async (): Promise<NetworkStat> => {
  try {
    const pairs = await fetchTokenPairs(FEATURED_TOKENS);
    
    if (pairs.length === 0) {
      throw new Error('No pairs data available');
    }

    // Sum up 24h volume from all pairs
    const totalVolume = pairs.reduce((sum: number, pair: any) => {
      return sum + (pair.volume?.h24 || 0);
    }, 0);

    // Estimate previous 24h using h6 data
    const prevVolume = pairs.reduce((sum: number, pair: any) => {
      const h6Volume = pair.volume?.h6 || 0;
      return sum + h6Volume;
    }, 0) * 4;

    return {
      value: totalVolume,
      prevValue: prevVolume > 0 ? prevVolume : undefined,
      timestamp: new Date()
    };
  } catch (error) {
    console.error('Error fetching DEX volume:', error);
    throw error;
  }
};

/**
 * Fetch total transactions for PulseChain (24h)
 * Using DexScreener transaction data from featured pairs
 */
const fetchTransactions24h = async (): Promise<NetworkStat> => {
  try {
    const pairs = await fetchTokenPairs(FEATURED_TOKENS);
    
    if (pairs.length === 0) {
      throw new Error('No pairs data available');
    }

    // Sum up 24h transactions (buys + sells) from all pairs
    const totalTxs = pairs.reduce((sum: number, pair: any) => {
      const buys = pair.txns?.h24?.buys || 0;
      const sells = pair.txns?.h24?.sells || 0;
      return sum + buys + sells;
    }, 0);

    // Estimate previous 24h using h6 data
    const prevTxs = pairs.reduce((sum: number, pair: any) => {
      const buys = pair.txns?.h6?.buys || 0;
      const sells = pair.txns?.h6?.sells || 0;
      return sum + buys + sells;
    }, 0) * 4;

    return {
      value: totalTxs,
      prevValue: prevTxs > 0 ? prevTxs : undefined,
      timestamp: new Date()
    };
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};

/**
 * Hook to fetch PulseChain network stats with polling
 */
export const useNetworkStats = (pollIntervalMs: number = 30000) => {
  const txQuery = useQuery({
    queryKey: ['network-stats-txs'],
    queryFn: fetchTransactions24h,
    refetchInterval: pollIntervalMs,
    staleTime: 20000,
    retry: 2,
  });

  const volumeQuery = useQuery({
    queryKey: ['network-stats-volume'],
    queryFn: fetchDexVolume24h,
    refetchInterval: pollIntervalMs,
    staleTime: 20000,
    retry: 2,
  });

  return {
    transactions: txQuery.data || null,
    dexVolume: volumeQuery.data || null,
    isLoading: txQuery.isLoading || volumeQuery.isLoading,
    isError: txQuery.isError || volumeQuery.isError,
    error: txQuery.error || volumeQuery.error,
  };
};
