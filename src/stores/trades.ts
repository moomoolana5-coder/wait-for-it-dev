import { create } from 'zustand';
import { Trade } from '@/types/market';
import { supabase } from '@/integrations/supabase/client';

type TradesStore = {
  trades: Trade[];
  initialized: boolean;
  loading: boolean;
  init: () => Promise<void>;
  addTrade: (trade: Trade) => Promise<void>;
  getTrades: (marketId?: string, wallet?: string) => Trade[];
  subscribeToTrades: () => () => void;
};

export const useTradesStore = create<TradesStore>((set, get) => ({
  trades: [],
  initialized: false,
  loading: false,

  init: async () => {
    if (get().initialized) return;
    
    set({ loading: true });
    
    try {
      // Fetch all trades from Supabase
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .order('ts', { ascending: false });

      if (error) throw error;

      const trades: Trade[] = (data || []).map((t: any) => ({
        id: t.id,
        marketId: t.market_id,
        wallet: t.wallet,
        userId: t.user_id,
        side: t.side,
        amountPts: parseFloat(t.amount_pts),
        price: parseFloat(t.price),
        shares: parseFloat(t.shares),
        ts: t.ts
      }));

      set({ trades, initialized: true, loading: false });
    } catch (error) {
      console.error('Error loading trades:', error);
      set({ loading: false, initialized: true });
    }
  },

  addTrade: async (trade) => {
    try {
      // Save to Supabase
      const { error } = await supabase
        .from('trades')
        .insert({
          id: trade.id,
          market_id: trade.marketId,
          wallet: trade.wallet,
          user_id: trade.userId || null,
          side: trade.side,
          amount_pts: trade.amountPts,
          price: trade.price,
          shares: trade.shares,
          ts: trade.ts
        });

      if (error) throw error;

      // Update local state
      const trades = [trade, ...get().trades];
      set({ trades });
    } catch (error) {
      console.error('Error adding trade:', error);
      throw error;
    }
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

  subscribeToTrades: () => {
    const channel = supabase
      .channel('trades-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'trades'
        },
        (payload) => {
          const newTrade: Trade = {
            id: payload.new.id,
            marketId: payload.new.market_id,
            wallet: payload.new.wallet,
            userId: payload.new.user_id,
            side: payload.new.side,
            amountPts: parseFloat(payload.new.amount_pts),
            price: parseFloat(payload.new.price),
            shares: parseFloat(payload.new.shares),
            ts: payload.new.ts
          };
          
          const trades = [newTrade, ...get().trades];
          set({ trades });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}));
