import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

export type Position = {
  id: string;
  userId?: string | null;
  walletAddress: string;
  marketId: string;
  side: string;
  shares: number;
  costBasis: number;
  claimed: boolean;
  createdAt: string;
  updatedAt: string;
};

type PositionsStore = {
  positions: Position[];
  initialized: boolean;
  loading: boolean;
  init: (walletAddress: string) => Promise<void>;
  getPositions: (marketId?: string) => Position[];
  getPosition: (marketId: string, side: string) => Position | undefined;
  upsertPosition: (position: Omit<Position, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  subscribeToPositions: (walletAddress: string) => () => void;
};

export const usePositionsStore = create<PositionsStore>((set, get) => ({
  positions: [],
  initialized: false,
  loading: false,

  init: async (walletAddress: string) => {
    if (get().initialized) return;
    
    set({ loading: true });
    
    try {
      const { data, error } = await supabase
        .from('positions')
        .select('*')
        .eq('wallet_address', walletAddress);

      if (error) throw error;

      const positions: Position[] = (data || []).map((p: any) => ({
        id: p.id,
        userId: p.user_id,
        walletAddress: p.wallet_address,
        marketId: p.market_id,
        side: p.side,
        shares: parseFloat(p.shares),
        costBasis: parseFloat(p.cost_basis),
        claimed: p.claimed,
        createdAt: p.created_at,
        updatedAt: p.updated_at
      }));

      set({ positions, initialized: true, loading: false });
    } catch (error) {
      console.error('Error loading positions:', error);
      set({ loading: false, initialized: true });
    }
  },

  getPositions: (marketId?) => {
    let filtered = get().positions;
    
    if (marketId) {
      filtered = filtered.filter((p) => p.marketId === marketId);
    }
    
    return filtered;
  },

  getPosition: (marketId: string, side: string) => {
    return get().positions.find((p) => p.marketId === marketId && p.side === side);
  },

  upsertPosition: async (position) => {
    try {
      const { data, error} = await supabase
        .from('positions')
        .upsert({
          wallet_address: position.walletAddress,
          market_id: position.marketId,
          side: position.side,
          shares: position.shares,
          cost_basis: position.costBasis,
          user_id: position.userId,
          claimed: position.claimed
        }, {
          onConflict: 'wallet_address,market_id,side'
        })
        .select()
        .single();

      if (error) throw error;

      const newPosition: Position = {
        id: data.id,
        userId: data.user_id,
        walletAddress: data.wallet_address,
        marketId: data.market_id,
        side: data.side,
        shares: data.shares,
        costBasis: data.cost_basis,
        claimed: data.claimed,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      // Update local state
      const positions = get().positions.filter(
        (p) => !(p.marketId === newPosition.marketId && p.side === newPosition.side)
      );
      positions.push(newPosition);
      
      set({ positions });
    } catch (error) {
      console.error('Error upserting position:', error);
      throw error;
    }
  },

  subscribeToPositions: (walletAddress: string) => {
    const channel = supabase
      .channel('positions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'positions',
          filter: `wallet_address=eq.${walletAddress}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const newPosition: Position = {
              id: payload.new.id,
              userId: payload.new.user_id,
              walletAddress: payload.new.wallet_address,
              marketId: payload.new.market_id,
              side: payload.new.side,
              shares: payload.new.shares,
              costBasis: payload.new.cost_basis,
              claimed: payload.new.claimed,
              createdAt: payload.new.created_at,
              updatedAt: payload.new.updated_at
            };
            
            const positions = get().positions.filter(
              (p) => !(p.marketId === newPosition.marketId && p.side === newPosition.side)
            );
            positions.push(newPosition);
            set({ positions });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}));
