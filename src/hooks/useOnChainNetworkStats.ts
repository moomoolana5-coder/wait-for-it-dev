import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface NetworkStat {
  value: number;
  prevValue?: number;
  timestamp: Date;
  source?: string;
}

interface OnChainNetworkStats {
  transactions: NetworkStat | null;
  networkVolume: NetworkStat | null;
}

const fetchOnChainStats = async (): Promise<OnChainNetworkStats> => {
  try {
    const { data, error } = await supabase.functions.invoke('pulse-stats', {
      method: 'GET',
    });

    if (error) throw error;

    if (!data) {
      throw new Error('No data received from pulse-stats function');
    }

    return {
      transactions: {
        value: data.tx24h?.value || 0,
        prevValue: data.tx24h?.prevValue,
        timestamp: new Date(data.tx24h?.updatedAt || Date.now()),
        source: data.tx24h?.source,
      },
      networkVolume: {
        value: data.networkVolume24h?.value || 0,
        prevValue: data.networkVolume24h?.prevValue,
        timestamp: new Date(data.networkVolume24h?.updatedAt || Date.now()),
        source: data.networkVolume24h?.source,
      },
    };
  } catch (error) {
    console.error('Error fetching on-chain stats:', error);
    // Return fallback data instead of throwing
    return {
      transactions: {
        value: 0,
        prevValue: 0,
        timestamp: new Date(),
        source: 'error-fallback',
      },
      networkVolume: {
        value: 0,
        prevValue: 0,
        timestamp: new Date(),
        source: 'error-fallback',
      },
    };
  }
};

export const useOnChainNetworkStats = (pollIntervalMs: number = 30000) => {
  const query = useQuery({
    queryKey: ['onchain-network-stats'],
    queryFn: fetchOnChainStats,
    refetchInterval: pollIntervalMs,
    staleTime: 20000,
    retry: 2,
  });

  return {
    transactions: query.data?.transactions || null,
    networkVolume: query.data?.networkVolume || null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
};
