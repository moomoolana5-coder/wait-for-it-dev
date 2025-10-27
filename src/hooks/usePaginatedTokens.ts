import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

interface Token {
  address: string;
  name: string;
  symbol: string;
}

interface DexPair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: Token;
  quoteToken: Token;
  priceNative: string;
  priceUsd: string;
  txns: {
    h24: {
      buys: number;
      sells: number;
    };
  };
  volume: {
    h24: number;
  };
  priceChange: {
    h24: number;
  };
  liquidity: {
    usd: number;
  };
  fdv?: number;
  marketCap?: number;
  pairCreatedAt: number;
  info?: {
    imageUrl?: string;
  };
}

interface TokenWithVotes extends DexPair {
  voteCount?: number;
}

const PAGE_SIZE = 20;

// Normalization helper for scoring
const normalize = (value: number, min: number, max: number): number => {
  if (max === min) return 0;
  return (value - min) / (max - min);
};

// Calculate trending score
const calculateTrendingScore = (tokens: DexPair[]): DexPair[] => {
  // Filter out low liquidity tokens to reduce noise
  const filtered = tokens.filter(t => (t.liquidity?.usd || 0) >= 3000);
  
  if (filtered.length === 0) return [];

  // Calculate min/max for normalization
  const volumes = filtered.map(t => t.volume?.h24 || 0);
  const priceChanges = filtered.map(t => Math.abs(t.priceChange?.h24 || 0));
  const trades = filtered.map(t => ((t.txns?.h24?.buys || 0) + (t.txns?.h24?.sells || 0)));
  const votes = filtered.map(t => (t as any).voteCount || 0);

  const minVol = Math.min(...volumes);
  const maxVol = Math.max(...volumes);
  const minPrice = Math.min(...priceChanges);
  const maxPrice = Math.max(...priceChanges);
  const minTrades = Math.min(...trades);
  const maxTrades = Math.max(...trades);
  const minVotes = Math.min(...votes);
  const maxVotes = Math.max(...votes);

  // Default weights
  let w1 = 0.45; // volume
  let w2 = 0.25; // price change
  let w3 = 0.20; // trades
  let w4 = 0.10; // votes

  // Adjust weights if data is missing
  const hasVolume = maxVol > minVol;
  const hasPriceChange = maxPrice > minPrice;
  const hasTrades = maxTrades > minTrades;
  const hasVotes = maxVotes > minVotes;

  const availableWeights = [hasVolume, hasPriceChange, hasTrades, hasVotes];
  const activeCount = availableWeights.filter(Boolean).length;

  if (activeCount === 0) return filtered;

  // Redistribute weights proportionally
  const totalWeight = 1.0;
  const weightPerActive = totalWeight / activeCount;
  
  w1 = hasVolume ? weightPerActive : 0;
  w2 = hasPriceChange ? weightPerActive : 0;
  w3 = hasTrades ? weightPerActive : 0;
  w4 = hasVotes ? weightPerActive : 0;

  return filtered.map(token => {
    const normVol = hasVolume ? normalize(token.volume?.h24 || 0, minVol, maxVol) : 0;
    const normPrice = hasPriceChange ? normalize(Math.abs(token.priceChange?.h24 || 0), minPrice, maxPrice) : 0;
    const normTrades = hasTrades ? normalize((token.txns?.h24?.buys || 0) + (token.txns?.h24?.sells || 0), minTrades, maxTrades) : 0;
    const normVotes = hasVotes ? normalize((token as any).voteCount || 0, minVotes, maxVotes) : 0;

    const trendingScore = (w1 * normVol) + (w2 * normPrice) + (w3 * normTrades) + (w4 * normVotes);

    return {
      ...token,
      trendingScore,
    } as any;
  }).sort((a: any, b: any) => (b.trendingScore || 0) - (a.trendingScore || 0));
};

export const usePaginatedTokens = (allTokens: DexPair[], isLoading: boolean) => {
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const activeTab = searchParams.get('tab') || 'all';

  // Reset page when tab changes
  const currentTab = activeTab;
  const [lastTab, setLastTab] = useState(currentTab);
  
  if (currentTab !== lastTab) {
    setPage(1);
    setLastTab(currentTab);
  }

  const sortedAndFilteredTokens = useMemo(() => {
    if (!allTokens || allTokens.length === 0) return [];

    const now = Date.now();
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);

    // Deduplicate by pairAddress
    const uniqueTokens = Array.from(
      new Map(allTokens.map(t => [t.pairAddress, t])).values()
    );

    switch (activeTab) {
      case 'all':
        return uniqueTokens.sort((a, b) => {
          const liquidityDiff = (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0);
          if (liquidityDiff !== 0) return liquidityDiff;
          
          const volumeDiff = (b.volume?.h24 || 0) - (a.volume?.h24 || 0);
          if (volumeDiff !== 0) return volumeDiff;
          
          return (b.pairCreatedAt || 0) - (a.pairCreatedAt || 0);
        });

      case 'trending':
        return calculateTrendingScore(uniqueTokens);

      case 'top-tokens':
        return uniqueTokens.sort((a, b) => {
          if (a.marketCap && b.marketCap) {
            return b.marketCap - a.marketCap;
          }
          
          const liquidityDiff = (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0);
          if (liquidityDiff !== 0) return liquidityDiff;
          
          return (b.volume?.h24 || 0) - (a.volume?.h24 || 0);
        });

      case 'gainers':
        return uniqueTokens
          .filter(t => {
            const priceChange = t.priceChange?.h24 || 0;
            const volume = t.volume?.h24 || 0;
            const liquidity = t.liquidity?.usd || 0;
            
            // Filter: positive change, min volume 5k, min liquidity 2k
            return priceChange > 0 && volume >= 5000 && liquidity >= 2000;
          })
          .sort((a, b) => {
            const priceDiff = (b.priceChange?.h24 || 0) - (a.priceChange?.h24 || 0);
            if (priceDiff !== 0) return priceDiff;
            
            const volumeDiff = (b.volume?.h24 || 0) - (a.volume?.h24 || 0);
            if (volumeDiff !== 0) return volumeDiff;
            
            return (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0);
          });

      case 'new':
        return uniqueTokens
          .filter(t => {
            const createdAt = t.pairCreatedAt || 0;
            // Normalize timestamp (handle both ms and s)
            const timestamp = createdAt > 10000000000 ? createdAt : createdAt * 1000;
            return timestamp >= thirtyDaysAgo;
          })
          .sort((a, b) => (b.pairCreatedAt || 0) - (a.pairCreatedAt || 0));

      default:
        return uniqueTokens;
    }
  }, [allTokens, activeTab]);

  const paginatedTokens = useMemo(() => {
    return sortedAndFilteredTokens.slice(0, page * PAGE_SIZE);
  }, [sortedAndFilteredTokens, page]);

  const hasMore = paginatedTokens.length < sortedAndFilteredTokens.length;
  const total = sortedAndFilteredTokens.length;

  const loadMore = () => {
    if (hasMore && !isLoading) {
      setPage(prev => prev + 1);
    }
  };

  return {
    tokens: paginatedTokens,
    hasMore,
    loadMore,
    isLoading,
    total,
    currentCount: paginatedTokens.length,
    page,
  };
};
