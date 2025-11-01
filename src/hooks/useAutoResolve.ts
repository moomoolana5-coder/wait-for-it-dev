import { useEffect } from 'react';
import { useMarketsStore } from '@/stores/markets';
import { Market } from '@/types/market';

interface DexScreenerResponse {
  pairs?: Array<{
    priceUsd: string;
  }>;
}

export const useAutoResolve = (market: Market | undefined) => {
  const { updateMarket } = useMarketsStore();

  useEffect(() => {
    if (!market) return;

    const checkAndResolve = async () => {
      const now = new Date();
      const closesAt = new Date(market.closesAt);
      const resolvesAt = new Date(market.resolvesAt);

      // Close market if time has passed and still OPEN
      if (market.status === 'OPEN' && now >= closesAt) {
        console.log(`Auto-closing market: ${market.id}`);
        await updateMarket(market.id, { status: 'CLOSED' });
      }

      // Resolve market if time has passed and still CLOSED
      if (market.status === 'CLOSED' && now >= resolvesAt) {
        console.log(`Auto-resolving market: ${market.id}`);
        
        try {
          // Fetch current price
          if (market.resolutionType === 'PRICE_GE' && market.source.provider === 'DEXSCREENER') {
            const pairAddress = market.source.pairAddress;
            if (!pairAddress) {
              console.error('No pair address for market');
              return;
            }

            const response = await fetch(
              `https://api.dexscreener.com/latest/dex/pairs/pulsechain/${pairAddress}`
            );

            if (!response.ok) {
              console.error('DexScreener API error:', response.status);
              return;
            }

            const data: DexScreenerResponse = await response.json();
            if (!data.pairs || data.pairs.length === 0) {
              console.error('No pairs found');
              return;
            }

            const currentPrice = parseFloat(data.pairs[0].priceUsd);
            const threshold = market.source.threshold || 0;
            const winner = currentPrice >= threshold ? 'YES' : 'NO';

            console.log(`Market ${market.id}: Price ${currentPrice} vs Threshold ${threshold} = Winner: ${winner}`);

            // Update market with resolution
            await updateMarket(market.id, {
              status: 'RESOLVED',
              resolution: {
                winner,
                valueAtResolution: currentPrice,
                reason: `Price at resolution: $${currentPrice.toFixed(6)}. Threshold: $${threshold.toFixed(6)}`,
              },
            });
          }
        } catch (error) {
          console.error('Error resolving market:', error);
        }
      }
    };

    // Check immediately
    checkAndResolve();

    // Then check every 5 seconds
    const interval = setInterval(checkAndResolve, 5000);

    return () => clearInterval(interval);
  }, [market, updateMarket]);
};
