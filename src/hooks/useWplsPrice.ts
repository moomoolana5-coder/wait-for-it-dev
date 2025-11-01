import { useState, useEffect } from 'react';

interface WplsPrice {
  price: number;
  priceChange24h: number;
  volume24h: number;
  timestamp: string;
}

interface DexScreenerResponse {
  pairs?: Array<{
    priceUsd: string;
    priceChange?: {
      h24?: number;
    };
    volume?: {
      h24?: number;
    };
  }>;
}

export const useWplsPrice = () => {
  const [priceData, setPriceData] = useState<WplsPrice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrice = async () => {
    try {
      // WPLS/DAI pair on PulseX
      const pairAddress = '0x6753560538ECa67617A9Ce605178F788bE7E524E';
      
      const response = await fetch(
        `https://api.dexscreener.com/latest/dex/pairs/pulsechain/${pairAddress}`
      );

      if (!response.ok) {
        throw new Error(`DexScreener API error: ${response.status}`);
      }

      const data: DexScreenerResponse = await response.json();

      if (!data.pairs || data.pairs.length === 0) {
        throw new Error('No pairs found');
      }

      const pair = data.pairs[0];
      const newPriceData: WplsPrice = {
        price: parseFloat(pair.priceUsd),
        priceChange24h: pair.priceChange?.h24 || 0,
        volume24h: pair.volume?.h24 || 0,
        timestamp: new Date().toISOString(),
      };

      setPriceData(newPriceData);
      setError(null);
    } catch (err) {
      console.error('Error fetching WPLS price:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch price');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch immediately
    fetchPrice();

    // Then fetch every 10 seconds
    const interval = setInterval(fetchPrice, 10000);

    return () => clearInterval(interval);
  }, []);

  return { priceData, loading, error, refetch: fetchPrice };
};
