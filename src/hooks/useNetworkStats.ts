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
 * Fetch comprehensive PulseChain pairs from DexScreener
 * Uses token list endpoint to get maximum coverage
 */
const fetchAllPulseChainPairs = async (): Promise<any[]> => {
  try {
    // Strategy: Fetch top tokens by volume to get maximum pair coverage
    const topTokenAddresses = [
      '0xA1077a294dDE1B09bB078844df40758a5D0f9a27', // WPLS
      '0x2b591e99afE9f32eAA6214f7B7629768c40Eeb39', // HEX
      '0x95B303987A60C71504D99Aa1b13B4DA07b0790ab', // PLSX
      '0x15D38573d2feeb82e7ad5187aB8c1D52810B1f07', // USDC
      '0xefD766cCb38EaF1dfd701853BFCe31359239F305', // DAI
      '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI (bridged)
      '0x0Cb6F5a34ad42ec934882A05265A7d5F59b51A2f', // USDT
      '0x2fa878Ab3F87CC1C9737Fc071108F904c0B0C95d', // INC
      '0x4Eb7C1c05087f98Ae617d006F48914eE73fF8D2A', // XGAME
      '0xec4252e62C6dE3D655cA9Ce3AfC12E553ebBA274', // PUMP
    ];

    const allPairs: any[] = [];
    const seenPairs = new Set<string>();

    // Fetch pairs in parallel batches
    const batchSize = 5;
    for (let i = 0; i < topTokenAddresses.length; i += batchSize) {
      const batch = topTokenAddresses.slice(i, i + batchSize);
      const promises = batch.map(async (address) => {
        try {
          const response = await fetch(`${DEXSCREENER_API}/search?q=${address}`);
          if (!response.ok) return [];
          const data = await response.json();
          
          // Filter for PulseChain pairs only
          const pairs = data.pairs?.filter((p: any) => 
            p.chainId === 'pulsechain' && 
            p.volume?.h24 > 0 // Only active pairs with volume
          ) || [];
          
          return pairs;
        } catch (error) {
          console.warn(`Failed to fetch pairs for ${address}:`, error);
          return [];
        }
      });

      const batchResults = await Promise.all(promises);
      
      // Deduplicate by pair address
      batchResults.flat().forEach(pair => {
        if (pair.pairAddress && !seenPairs.has(pair.pairAddress)) {
          seenPairs.add(pair.pairAddress);
          allPairs.push(pair);
        }
      });
    }

    console.log(`✅ Fetched ${allPairs.length} unique PulseChain pairs from DexScreener`);
    return allPairs;
    
  } catch (error) {
    console.error('Error fetching PulseChain pairs:', error);
    throw error;
  }
};

/**
 * Fetch total DEX volume for PulseChain (24h)
 * Aggregates from all active pairs on DexScreener
 */
const fetchDexVolume24h = async (): Promise<NetworkStat> => {
  try {
    const pairs = await fetchAllPulseChainPairs();
    
    if (pairs.length === 0) {
      throw new Error('No pairs data available');
    }

    // Calculate total 24h volume
    const totalVolume = pairs.reduce((sum: number, pair: any) => {
      const volume = pair.volume?.h24 || 0;
      return sum + volume;
    }, 0);

    // Calculate previous 24h estimate from h6 data
    const prevVolume = pairs.reduce((sum: number, pair: any) => {
      const h6Volume = pair.volume?.h6 || 0;
      return sum + h6Volume;
    }, 0) * 4; // Multiply by 4 to estimate 24h

    console.log(`📊 PulseChain DEX Volume: ${pairs.length} pairs | $${(totalVolume / 1_000_000).toFixed(2)}M (24h)`);

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
 * Fetch total DEX transactions for PulseChain (24h)
 * Aggregates from all active pairs on DexScreener
 */
const fetchTransactions24h = async (): Promise<NetworkStat> => {
  try {
    const pairs = await fetchAllPulseChainPairs();
    
    if (pairs.length === 0) {
      throw new Error('No pairs data available');
    }

    // Calculate total 24h transactions (buys + sells)
    const totalTxs = pairs.reduce((sum: number, pair: any) => {
      const buys = pair.txns?.h24?.buys || 0;
      const sells = pair.txns?.h24?.sells || 0;
      return sum + buys + sells;
    }, 0);

    // Calculate previous 24h estimate from h6 data
    const prevTxs = pairs.reduce((sum: number, pair: any) => {
      const buys = pair.txns?.h6?.buys || 0;
      const sells = pair.txns?.h6?.sells || 0;
      return sum + buys + sells;
    }, 0) * 4; // Multiply by 4 to estimate 24h

    console.log(`📈 PulseChain DEX Txns: ${pairs.length} pairs | ${totalTxs.toLocaleString()} transactions (24h)`);

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
