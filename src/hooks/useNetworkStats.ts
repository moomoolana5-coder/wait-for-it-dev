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
const PULSESCAN_API = 'https://api.scan.pulsechain.com/api';

/**
 * Fetch all active PulseChain pairs from DexScreener
 * Uses multiple major base tokens to get comprehensive coverage
 */
const fetchAllPulseChainPairs = async (): Promise<any[]> => {
  try {
    // Fetch pairs for major base tokens to get comprehensive network coverage
    const majorTokens = [
      '0xA1077a294dDE1B09bB078844df40758a5D0f9a27', // WPLS (most pairs)
      '0x2b591e99afE9f32eAA6214f7B7629768c40Eeb39', // HEX
      '0x95B303987A60C71504D99Aa1b13B4DA07b0790ab', // PLSX
      '0x15D38573d2feeb82e7ad5187aB8c1D52810B1f07', // USDC
      '0xefD766cCb38EaF1dfd701853BFCe31359239F305', // DAI
    ];

    const allPairs: any[] = [];
    const seenPairs = new Set<string>();

    // Fetch pairs for each major token
    const promises = majorTokens.map(async (token) => {
      try {
        const response = await fetch(`${DEXSCREENER_API}/search?q=${token}`);
        if (!response.ok) return [];
        const data = await response.json();
        return data.pairs?.filter((p: any) => p.chainId === 'pulsechain') || [];
      } catch {
        return [];
      }
    });

    const results = await Promise.all(promises);
    
    // Deduplicate pairs by address
    results.flat().forEach(pair => {
      if (pair.pairAddress && !seenPairs.has(pair.pairAddress)) {
        seenPairs.add(pair.pairAddress);
        allPairs.push(pair);
      }
    });

    return allPairs;
  } catch (error) {
    console.error('Error fetching PulseChain pairs:', error);
    throw error;
  }
};

/**
 * Fetch total DEX volume for PulseChain (24h)
 * Aggregates volume from ALL active PulseChain pairs
 */
const fetchDexVolume24h = async (): Promise<NetworkStat> => {
  try {
    const pairs = await fetchAllPulseChainPairs();
    
    if (pairs.length === 0) {
      throw new Error('No pairs data available');
    }

    // Sum up 24h volume from all pairs
    const totalVolume = pairs.reduce((sum: number, pair: any) => {
      return sum + (pair.volume?.h24 || 0);
    }, 0);

    // Estimate previous 24h using h6 data (multiply by 4 for 24h approximation)
    const prevVolume = pairs.reduce((sum: number, pair: any) => {
      const h6Volume = pair.volume?.h6 || 0;
      return sum + h6Volume;
    }, 0) * 4;

    console.log(`PulseChain DEX Stats: ${pairs.length} pairs, $${(totalVolume / 1000000).toFixed(2)}M volume`);

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
 * Aggregates DEX transactions from ALL active PulseChain pairs
 */
const fetchTransactions24h = async (): Promise<NetworkStat> => {
  try {
    const pairs = await fetchAllPulseChainPairs();
    
    if (pairs.length === 0) {
      throw new Error('No pairs data available');
    }

    // Sum up 24h transactions (buys + sells) from all pairs
    const totalTxs = pairs.reduce((sum: number, pair: any) => {
      const buys = pair.txns?.h24?.buys || 0;
      const sells = pair.txns?.h24?.sells || 0;
      return sum + buys + sells;
    }, 0);

    // Estimate previous 24h using h6 data (multiply by 4 for 24h approximation)
    const prevTxs = pairs.reduce((sum: number, pair: any) => {
      const buys = pair.txns?.h6?.buys || 0;
      const sells = pair.txns?.h6?.sells || 0;
      return sum + buys + sells;
    }, 0) * 4;

    console.log(`PulseChain TX Stats: ${pairs.length} pairs, ${totalTxs.toLocaleString()} transactions`);

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
