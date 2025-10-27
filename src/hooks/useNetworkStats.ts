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

// Ambil seluruh pasangan di PulseChain langsung dari Dexscreener
// Ini mencakup lintas DEX (pulsex, 9mm, dst), bukan per token saja
const fetchAllPulseChainPairs = async (): Promise<any[]> => {
  try {
    const res = await fetch(`${DEXSCREENER_API}/pairs/pulsechain`);
    if (!res.ok) return [] as any[];
    const data = await res.json();
    // Ambil hanya pasangan yang punya aktivitas atau likuiditas
    return (
      data.pairs?.filter(
        (p: any) => (p.volume?.h24 || 0) > 0 || (p.txns?.h24?.buys || 0) + (p.txns?.h24?.sells || 0) > 0 || (p.liquidity?.usd || 0) > 0
      ) || []
    );
  } catch {
    return [] as any[];
  }
};

// DexScreener-wide aggregation for PulseChain
const fetchDexVolume24h = async (): Promise<NetworkStat> => {
  const pairs = await fetchAllPulseChainPairs();

  // Jangan melempar error — fallback ke 0 agar UI tidak rusak
  const value = pairs.reduce((sum: number, p: any) => sum + (p.volume?.h24 || 0), 0);
  const prevValue = pairs.reduce((sum: number, p: any) => sum + (p.volume?.h6 || 0), 0) * 4;

  return { value, prevValue: prevValue > 0 ? prevValue : undefined, timestamp: new Date() };
};

const fetchTransactions24h = async (): Promise<NetworkStat> => {
  const pairs = await fetchAllPulseChainPairs();

  // Agregasi total transaksi DEX (buys + sells) selama 24 jam di seluruh PulseChain
  const value = pairs.reduce((sum: number, p: any) => {
    const buys = p.txns?.h24?.buys || 0;
    const sells = p.txns?.h24?.sells || 0;
    return sum + buys + sells;
  }, 0);

  const prevValue = pairs.reduce((sum: number, p: any) => {
    const buys = p.txns?.h6?.buys || 0;
    const sells = p.txns?.h6?.sells || 0;
    return sum + buys + sells;
  }, 0) * 4;

  return { value, prevValue: prevValue > 0 ? prevValue : undefined, timestamp: new Date() };
};

// Public hook
export const useNetworkStats = (pollIntervalMs: number = 30000) => {
  const txQuery = useQuery({
    queryKey: ['network-stats-txs-dxscreener'],
    queryFn: fetchTransactions24h,
    refetchInterval: pollIntervalMs,
    staleTime: 20000,
    retry: 2,
  });

  const volumeQuery = useQuery({
    queryKey: ['network-stats-volume-dxscreener'],
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
