import { create } from 'zustand';
import { Market } from '@/types/market';
import { persist } from '@/lib/persist';
import { generateSeedMarkets } from '@/lib/seed';

const MARKETS_VERSION = 2; // Increment to force refresh

type MarketsStore = {
  markets: Market[];
  initialized: boolean;
  init: () => void;
  addMarket: (market: Market) => void;
  updateMarket: (id: string, updates: Partial<Market>) => void;
  deleteMarket: (id: string) => void;
  getMarket: (id: string) => Market | undefined;
  incrementTrending: (id: string) => void;
};

export const useMarketsStore = create<MarketsStore>((set, get) => ({
  markets: [],
  initialized: false,

  init: () => {
    const storedVersion = localStorage.getItem('pm_markets_version');
    const currentVersion = MARKETS_VERSION.toString();
    
    // Force refresh if version changed
    if (storedVersion !== currentVersion) {
      localStorage.removeItem('pm_markets');
      localStorage.setItem('pm_markets_version', currentVersion);
    }
    
    const existing = persist.getMarkets();
    
    if (existing.length === 0) {
      const seeds = generateSeedMarkets();
      persist.setMarkets(seeds);
      set({ markets: seeds, initialized: true });
    } else {
      set({ markets: existing, initialized: true });
    }
  },

  addMarket: (market) => {
    const markets = [...get().markets, market];
    persist.setMarkets(markets);
    set({ markets });
  },

  updateMarket: (id, updates) => {
    const markets = get().markets.map((m) =>
      m.id === id ? { ...m, ...updates } : m
    );
    persist.setMarkets(markets);
    set({ markets });
  },

  deleteMarket: (id) => {
    const markets = get().markets.filter((m) => m.id !== id);
    persist.setMarkets(markets);
    set({ markets });
  },

  getMarket: (id) => {
    return get().markets.find((m) => m.id === id);
  },

  incrementTrending: (id) => {
    const markets = get().markets.map((m) =>
      m.id === id ? { ...m, trendingScore: m.trendingScore + 1 } : m
    );
    persist.setMarkets(markets);
    set({ markets });
  },
}));
