const DEXSCREENER_BASE = 'https://api.dexscreener.com/latest/dex';
const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

export const oracles = {
  async getDexScreenerPrice(pairAddress: string): Promise<number | null> {
    try {
      const res = await fetch(`${DEXSCREENER_BASE}/pairs/pulsechain/${pairAddress}`);
      if (!res.ok) return null;
      const data = await res.json();
      if (data.pair && data.pair.priceUsd) {
        return parseFloat(data.pair.priceUsd);
      }
      return null;
    } catch {
      return null;
    }
  },

  async getCoinGeckoPrice(coinId: string): Promise<number | null> {
    try {
      const res = await fetch(`${COINGECKO_BASE}/simple/price?ids=${coinId}&vs_currencies=usd`);
      if (!res.ok) return null;
      const data = await res.json();
      return data[coinId]?.usd || null;
    } catch {
      return null;
    }
  },

  async getCoinGeckoRank(coinId: string): Promise<number | null> {
    try {
      const res = await fetch(`${COINGECKO_BASE}/coins/${coinId}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.market_cap_rank || null;
    } catch {
      return null;
    }
  },

  async getDexScreenerCandles(pairAddress: string, timeframe: '24h' | '7d' | '30d' | 'all'): Promise<any[]> {
    try {
      // DexScreener doesn't have a direct candles endpoint for free tier
      // We'll use the ticker data and simulate candles or return empty
      return [];
    } catch {
      return [];
    }
  },

  async getCoinGeckoChart(coinId: string, days: number): Promise<any[]> {
    try {
      const res = await fetch(`${COINGECKO_BASE}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.prices || [];
    } catch {
      return [];
    }
  },

  async checkHealth(): Promise<{ dex: boolean; cg: boolean }> {
    const dexPromise = fetch(`${DEXSCREENER_BASE}/tokens/0x2b591e99afe9f32eaa6214f7b7629768c40eeb39`).then(r => r.ok).catch(() => false);
    const cgPromise = fetch(`${COINGECKO_BASE}/ping`).then(r => r.ok).catch(() => false);
    const [dex, cg] = await Promise.all([dexPromise, cgPromise]);
    return { dex, cg };
  },
};
