import { useQuery } from '@tanstack/react-query';

interface NetworkStat {
  value: number;
  prevValue?: number;
  timestamp: Date;
}

interface NetworkStats {
  transactions: NetworkStat | null;
  dexVolume: NetworkStat | null;
  transactionHistory: Array<{ value: number }>;
  volumeHistory: Array<{ value: number }>;
}

const DEXSCREENER_API = 'https://api.dexscreener.com/latest/dex';

// Anchor tokens untuk mencakup mayoritas ekosistem PulseChain lintas DEX
// WPLS sebagai base utama + inti stable dan token ekosistem kunci
const ANCHOR_TOKENS: string[] = [
  '0xA1077a294dDE1B09bB078844df40758a5D0f9a27', // WPLS (Wrapped Pulse)
  '0x260e5dA7eF6E30e0A647d1aDF47628198DCb0709', // PLS (native token address reference on DexScreener)
  '0x15D38573d2feeb82e7ad5187aB8c1D52810B1f07', // USDC (bridged)
  '0x0Cb6F5a34ad42ec934882A05265A7d5F59b51A2f', // USDT (bridged)
  '0xefD766cCb38EaF1dfd701853BFCe31359239F305', // DAI (from ETH)
  '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI (bridged alt)
  '0x95B303987A60C71504D99Aa1b13B4DA07b0790ab', // PLSX (common address)
  '0xd73731bDA87C3464e76268c094D959c1B35b9bF1', // PLSX (alt seen in DexScreener)
  '0x2fa878Ab3F87CC1C9737Fc071108F904c0B0C95d', // INC
  '0x2b591e99afE9f32eAA6214f7B7629768c40Eeb39', // HEX
  '0x57fde0a71132198BBeC939B98976993d8D89D225', // HEX (from Ethereum)
  '0xec4252e62C6dE3D655cA9Ce3AfC12E553ebBA274', // PUMP
  '0x4Eb7C1c05087f98Ae617d006F48914eE73fF8D2A', // XGAME
  '0x709e07230860FE0543DCBC359Fdf1D1b5eD13305', // MARS
  '0xDDe9164E7E0DA7ae48b58F36B42c1c9f80e7245F', // DOGE
  '0x495d9b70480A22a82D0FB81981480764BA55550e', // MOG
  '0xb8A7bC2c6d5C1f28a8a95Dd0E7676611cfF4b075', // ALMIGHTY
  '0xbe2cd67164B3c1Ae1D0b6E1def14df663a64B263', // PFF (Pulse For Freedom)
  '0x94534EeEe131840b1c0F61847c572228bdfDDE93', // pTGC (The Grays Currency)
  '0xC0D9DF5EbF8aE4B4F74F68270CF872997d05C3b2', // DOOM
  '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // WBTC
  '0xe33a5AE21F93aceC5CfC0b7b0FDBB65A0f0Be5cC', // MOST (MostWanted)
];

const fetchPairsForAddress = async (address: string) => {
  try {
    const res = await fetch(`${DEXSCREENER_API}/search?q=${address}`);
    if (!res.ok) return [] as any[];
    const data = await res.json();
    return (
      data.pairs?.filter((p: any) => p.chainId === 'pulsechain' && ((p.volume?.h24 || 0) > 0 || (p.txns?.h24?.buys || 0) + (p.txns?.h24?.sells || 0) > 0)) || []
    );
  } catch {
    return [] as any[];
  }
};

// Kumpulkan semua pairs unik di PulseChain berbasis anchor tokens (dengan deduplikasi)
const fetchAllPulseChainPairs = async (): Promise<any[]> => {
  const seen = new Set<string>();
  const results = await Promise.all(ANCHOR_TOKENS.map((addr) => fetchPairsForAddress(addr)));
  const all: any[] = [];
  results.flat().forEach((pair: any) => {
    const id = pair?.pairAddress || `${pair?.baseToken?.address}-${pair?.quoteToken?.address}`;
    if (id && !seen.has(id)) {
      seen.add(id);
      all.push(pair);
    }
  });
  return all;
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

  // Generate sparkline data from h6 to h24 (simulating 24h trend with 4 data points)
  const transactionHistory = txQuery.data ? [
    { value: (txQuery.data.prevValue || txQuery.data.value) * 0.7 },
    { value: (txQuery.data.prevValue || txQuery.data.value) * 0.85 },
    { value: (txQuery.data.prevValue || txQuery.data.value) * 0.95 },
    { value: txQuery.data.value }
  ] : [];

  const volumeHistory = volumeQuery.data ? [
    { value: (volumeQuery.data.prevValue || volumeQuery.data.value) * 0.7 },
    { value: (volumeQuery.data.prevValue || volumeQuery.data.value) * 0.85 },
    { value: (volumeQuery.data.prevValue || volumeQuery.data.value) * 0.95 },
    { value: volumeQuery.data.value }
  ] : [];

  return {
    transactions: txQuery.data || null,
    dexVolume: volumeQuery.data || null,
    transactionHistory,
    volumeHistory,
    isLoading: txQuery.isLoading || volumeQuery.isLoading,
    isError: txQuery.isError || volumeQuery.isError,
    error: txQuery.error || volumeQuery.error,
  };
};
