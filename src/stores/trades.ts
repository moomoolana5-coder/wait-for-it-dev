import { create } from 'zustand';
import { Trade } from '@/types/market';
import { persist } from '@/lib/persist';

type TradesStore = {
  trades: Trade[];
  initialized: boolean;
  init: () => void;
  addTrade: (trade: Trade) => void;
  getTrades: (marketId?: string, wallet?: string) => Trade[];
};

export const useTradesStore = create<TradesStore>((set, get) => ({
  trades: [],
  initialized: false,

  init: () => {
    const existing = persist.getTrades();
    set({ trades: existing, initialized: true });
  },

  addTrade: (trade) => {
    const trades = [...get().trades, trade];
    persist.setTrades(trades);
    set({ trades });
  },

  getTrades: (marketId?, wallet?) => {
    let filtered = get().trades;

    if (marketId) {
      filtered = filtered.filter((t) => t.marketId === marketId);
    }

    if (wallet) {
      filtered = filtered.filter((t) => t.wallet === wallet);
    }

    return filtered;
  },
}));
