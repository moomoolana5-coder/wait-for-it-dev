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

/**
 * Fetch total DEX volume for PulseChain (24h)
 * Aggregates volume from top pairs
 */
const fetchDexVolume24h = async (): Promise<NetworkStat> => {
  try {
    // Fetch latest pairs for PulseChain, sorted by volume
    const response = await fetch(`${DEXSCREENER_API}/pairs/pulsechain`);
    if (!response.ok) throw new Error('Failed to fetch DEX pairs');
    
    const data = await response.json();
    
    if (!data.pairs || data.pairs.length === 0) {
      throw new Error('No pairs data available');
    }

    // Sum up 24h volume from all pairs
    const totalVolume = data.pairs.reduce((sum: number, pair: any) => {
      return sum + (pair.volume?.h24 || 0);
    }, 0);

    // For prev value, we estimate using h6 data (approximation)
    // Real implementation would need historical API
    const prevVolume = data.pairs.reduce((sum: number, pair: any) => {
      const h6Volume = pair.volume?.h6 || 0;
      // Estimate 24h previous as current - (h6 * 4) approximation
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
 * Using DexScreener transaction data as proxy
 */
const fetchTransactions24h = async (): Promise<NetworkStat> => {
  try {
    const response = await fetch(`${DEXSCREENER_API}/pairs/pulsechain`);
    if (!response.ok) throw new Error('Failed to fetch pairs');
    
    const data = await response.json();
    
    if (!data.pairs || data.pairs.length === 0) {
      throw new Error('No pairs data available');
    }

    // Sum up 24h transactions (buys + sells) from all pairs
    const totalTxs = data.pairs.reduce((sum: number, pair: any) => {
      const buys = pair.txns?.h24?.buys || 0;
      const sells = pair.txns?.h24?.sells || 0;
      return sum + buys + sells;
    }, 0);

    // Estimate previous 24h using h6 data
    const prevTxs = data.pairs.reduce((sum: number, pair: any) => {
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
