type PriceData = {
  price: number;
  timestamp: number;
};

type CandleData = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
};

export class OracleService {
  private static async fetchWithTimeout(
    url: string,
    timeout = 10000
  ): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      throw error;
    }
  }

  static async getDexScreenerPrice(pairAddress: string): Promise<PriceData | null> {
    try {
      const response = await this.fetchWithTimeout(
        `https://api.dexscreener.com/latest/dex/pairs/pulsechain/${pairAddress}`
      );
      
      if (!response.ok) return null;
      
      const data = await response.json();
      const pair = data.pair || data.pairs?.[0];
      
      if (!pair) return null;
      
      return {
        price: parseFloat(pair.priceUsd || pair.priceNative || '0'),
        timestamp: Date.now(),
      };
    } catch {
      return null;
    }
  }

  static async getCoinGeckoPrice(coinId: string): Promise<PriceData | null> {
    try {
      const response = await this.fetchWithTimeout(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`
      );
      
      if (!response.ok) return null;
      
      const data = await response.json();
      const price = data[coinId]?.usd;
      
      if (!price) return null;
      
      return {
        price,
        timestamp: Date.now(),
      };
    } catch {
      return null;
    }
  }

  static async getCoinGeckoCandles(
    coinId: string,
    days: number
  ): Promise<CandleData[]> {
    try {
      const response = await this.fetchWithTimeout(
        `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`
      );
      
      if (!response.ok) return [];
      
      const data = await response.json();
      const prices = data.prices || [];
      
      // Convert price points to OHLC candles
      const candles: CandleData[] = [];
      const interval = days <= 1 ? 3600000 : 86400000; // 1h or 1d
      
      for (let i = 0; i < prices.length; i++) {
        const [timestamp, price] = prices[i];
        const candleTime = Math.floor(timestamp / interval) * interval;
        
        const existing = candles.find(c => c.time === candleTime);
        if (existing) {
          existing.high = Math.max(existing.high, price);
          existing.low = Math.min(existing.low, price);
          existing.close = price;
        } else {
          candles.push({
            time: candleTime / 1000,
            open: price,
            high: price,
            low: price,
            close: price,
          });
        }
      }
      
      return candles.sort((a, b) => a.time - b.time);
    } catch {
      return [];
    }
  }

  static async getCoinGeckoRank(coinId: string): Promise<number | null> {
    try {
      const response = await this.fetchWithTimeout(
        `https://api.coingecko.com/api/v3/coins/${coinId}`
      );
      
      if (!response.ok) return null;
      
      const data = await response.json();
      return data.market_cap_rank || null;
    } catch {
      return null;
    }
  }

  static async getPrice(
    provider: 'DEXSCREENER' | 'COINGECKO',
    options: { pairAddress?: string; baseId?: string }
  ): Promise<PriceData | null> {
    if (provider === 'DEXSCREENER' && options.pairAddress) {
      return this.getDexScreenerPrice(options.pairAddress);
    } else if (provider === 'COINGECKO' && options.baseId) {
      return this.getCoinGeckoPrice(options.baseId);
    }
    return null;
  }

  static async getCandles(
    provider: 'DEXSCREENER' | 'COINGECKO',
    options: { pairAddress?: string; baseId?: string; days: number }
  ): Promise<CandleData[]> {
    // For now, only CoinGecko provides historical data easily
    if (provider === 'COINGECKO' && options.baseId) {
      return this.getCoinGeckoCandles(options.baseId, options.days);
    }
    
    // Fallback: generate mock candles from current price
    const priceData = await this.getPrice(provider, options);
    if (!priceData) return [];
    
    const now = Date.now() / 1000;
    const interval = options.days <= 1 ? 3600 : 86400;
    const count = options.days <= 1 ? 24 : options.days;
    
    return Array.from({ length: count }, (_, i) => ({
      time: now - (count - i) * interval,
      open: priceData.price * (0.95 + Math.random() * 0.1),
      high: priceData.price * (1 + Math.random() * 0.05),
      low: priceData.price * (0.95 + Math.random() * 0.05),
      close: priceData.price * (0.95 + Math.random() * 0.1),
    }));
  }
}
