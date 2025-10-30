import { create } from 'zustand';
import { Trade } from '@/types/markets';
import { persist } from '@/lib/persist';

interface TradesState {
  trades: Trade[];
  init: () => void;
  addTrade: (trade: Trade) => void;
  getTrades: () => Trade[];
  getTradesByMarket: (marketId: string) => Trade[];
  getTradesByWallet: (wallet: string) => Trade[];
}

export const useTradesStore = create<TradesState>((set, get) => ({
  trades: [],

  init: () => {
    const stored = persist.getTrades();
    set({ trades: stored });
  },

  addTrade: (trade) => {
    const trades = [...get().trades, trade];
    persist.setTrades(trades);
    set({ trades });
  },

  getTrades: () => get().trades,

  getTradesByMarket: (marketId) => {
    return get().trades.filter((t) => t.marketId === marketId);
  },

  getTradesByWallet: (wallet) => {
    return get().trades.filter((t) => t.wallet === wallet);
  },
}));
