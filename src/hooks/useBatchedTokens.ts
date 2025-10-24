import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

interface TokenInfo {
  imageUrl?: string;
  websites?: { url: string }[];
  socials?: { type: string; url: string }[];
}

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
  info?: TokenInfo;
}

const DEXSCREENER_API = 'https://api.dexscreener.com/latest/dex';
const BATCH_SIZE = 15; // Fetch 15 tokens per batch
const BATCH_DELAY = 1000; // 1 second delay between batches

export const useBatchedTokens = (tokenAddresses: string[]) => {
  const [loadedPairs, setLoadedPairs] = useState<DexPair[]>([]);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBatch = async () => {
      if (currentBatch * BATCH_SIZE >= tokenAddresses.length) {
        setIsLoading(false);
        return;
      }

      const startIdx = currentBatch * BATCH_SIZE;
      const endIdx = Math.min(startIdx + BATCH_SIZE, tokenAddresses.length);
      const batchAddresses = tokenAddresses.slice(startIdx, endIdx);

      try {
        const addressesLower = batchAddresses.map((a) => a.toLowerCase());
        const wanted = new Set(addressesLower);

        // Fetch batch
        const r = await fetch(`${DEXSCREENER_API}/tokens/${addressesLower.join(',')}`);
        if (!r.ok) {
          console.warn(`Batch ${currentBatch} failed: HTTP ${r.status}`);
          setCurrentBatch(prev => prev + 1);
          return;
        }

        const d = await r.json();
        const pairs: DexPair[] = (d.pairs || []) as DexPair[];

        // Pick best pair per address
        const bestByAddress = new Map<string, DexPair>();
        for (const p of pairs) {
          if (p.chainId !== 'pulsechain') continue;
          const base = p.baseToken.address.toLowerCase();
          const quote = p.quoteToken.address.toLowerCase();
          const matched = wanted.has(base) ? base : wanted.has(quote) ? quote : undefined;
          if (!matched) continue;
          const current = bestByAddress.get(matched);
          if (!current || (p.liquidity?.usd || 0) > (current.liquidity?.usd || 0)) {
            bestByAddress.set(matched, p);
          }
        }

        const batchPairs = Array.from(bestByAddress.values());
        setLoadedPairs(prev => [...prev, ...batchPairs]);

        // Schedule next batch
        setTimeout(() => {
          setCurrentBatch(prev => prev + 1);
        }, BATCH_DELAY);

      } catch (error) {
        console.error(`Error loading batch ${currentBatch}:`, error);
        setCurrentBatch(prev => prev + 1);
      }
    };

    loadBatch();
  }, [currentBatch, tokenAddresses]);

  const totalBatches = Math.ceil(tokenAddresses.length / BATCH_SIZE);
  const progress = Math.min(100, Math.round(((currentBatch + 1) / totalBatches) * 100));

  return {
    data: loadedPairs,
    isLoading,
    progress,
    totalTokens: tokenAddresses.length,
    loadedTokens: loadedPairs.length,
  };
};
