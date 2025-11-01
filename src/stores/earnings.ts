import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

export type EarningType = 'MARKET_WIN' | 'REFERRAL_BONUS' | 'MARKET_CREATOR_FEE' | 'STREAK_BONUS';

export type Earning = {
  id: string;
  userId?: string | null;
  walletAddress: string;
  earningType: EarningType;
  amountPts: number;
  sourceId?: string | null;
  metadata?: any;
  claimed: boolean;
  createdAt: string;
};

type EarningsStore = {
  earnings: Earning[];
  initialized: boolean;
  loading: boolean;
  init: (walletAddress: string) => Promise<void>;
  getEarnings: (type?: EarningType) => Earning[];
  getTotalUnclaimed: () => number;
  getTotalEarned: () => number;
  addEarning: (earning: Omit<Earning, 'id' | 'createdAt' | 'claimed'>) => Promise<void>;
  claimEarnings: (walletAddress: string) => Promise<number>;
  subscribeToEarnings: (walletAddress: string) => () => void;
};

export const useEarningsStore = create<EarningsStore>((set, get) => ({
  earnings: [],
  initialized: false,
  loading: false,

  init: async (walletAddress: string) => {
    if (get().initialized) return;
    
    set({ loading: true });
    
    try {
      const { data, error } = await supabase
        .from('earnings')
        .select('*')
        .eq('wallet_address', walletAddress)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const earnings: Earning[] = (data || []).map((e: any) => ({
        id: e.id,
        userId: e.user_id,
        walletAddress: e.wallet_address,
        earningType: e.earning_type as EarningType,
        amountPts: parseFloat(e.amount_pts),
        sourceId: e.source_id,
        metadata: e.metadata,
        claimed: e.claimed,
        createdAt: e.created_at
      }));

      set({ earnings, initialized: true, loading: false });
    } catch (error) {
      console.error('Error loading earnings:', error);
      set({ loading: false, initialized: true });
    }
  },

  getEarnings: (type?) => {
    let filtered = get().earnings;
    
    if (type) {
      filtered = filtered.filter((e) => e.earningType === type);
    }
    
    return filtered;
  },

  getTotalUnclaimed: () => {
    return get().earnings
      .filter((e) => !e.claimed)
      .reduce((sum, e) => sum + e.amountPts, 0);
  },

  getTotalEarned: () => {
    return get().earnings
      .reduce((sum, e) => sum + e.amountPts, 0);
  },

  addEarning: async (earning) => {
    try {
      const { data, error } = await supabase
        .from('earnings')
        .insert({
          user_id: earning.userId,
          wallet_address: earning.walletAddress,
          earning_type: earning.earningType as string,
          amount_pts: earning.amountPts,
          source_id: earning.sourceId,
          metadata: earning.metadata,
          claimed: false
        })
        .select()
        .single();

      if (error) throw error;

      const newEarning: Earning = {
        id: data.id,
        userId: data.user_id,
        walletAddress: data.wallet_address,
        earningType: data.earning_type as EarningType,
        amountPts: data.amount_pts,
        sourceId: data.source_id,
        metadata: data.metadata,
        claimed: data.claimed,
        createdAt: data.created_at
      };

      set({ earnings: [newEarning, ...get().earnings] });
    } catch (error) {
      console.error('Error adding earning:', error);
      throw error;
    }
  },

  claimEarnings: async (walletAddress: string) => {
    try {
      const unclaimed = get().earnings.filter((e) => !e.claimed);
      const totalAmount = unclaimed.reduce((sum, e) => sum + e.amountPts, 0);

      if (totalAmount === 0) return 0;

      // Mark all as claimed
      const { error } = await supabase
        .from('earnings')
        .update({ claimed: true })
        .eq('wallet_address', walletAddress)
        .eq('claimed', false);

      if (error) throw error;

      // Update local state
      const earnings = get().earnings.map((e) => 
        !e.claimed ? { ...e, claimed: true } : e
      );
      set({ earnings });

      return totalAmount;
    } catch (error) {
      console.error('Error claiming earnings:', error);
      throw error;
    }
  },

  subscribeToEarnings: (walletAddress: string) => {
    const channel = supabase
      .channel('earnings-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'earnings',
          filter: `wallet_address=eq.${walletAddress}`
        },
        (payload) => {
          const newEarning: Earning = {
            id: payload.new.id,
            userId: payload.new.user_id,
            walletAddress: payload.new.wallet_address,
            earningType: payload.new.earning_type as EarningType,
            amountPts: payload.new.amount_pts,
            sourceId: payload.new.source_id,
            metadata: payload.new.metadata,
            claimed: payload.new.claimed,
            createdAt: payload.new.created_at
          };
          
          set({ earnings: [newEarning, ...get().earnings] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}));
