import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface WalletState {
  id?: string;
  points: number;
  pnlRealized: number;
  lastFaucetClaim?: string;
}

interface WalletDbStore {
  wallet: WalletState;
  loading: boolean;
  initialized: boolean;
  init: () => Promise<void>;
  fetchWallet: () => Promise<void>;
  addPoints: (amount: number) => Promise<void>;
  subtractPoints: (amount: number) => Promise<void>;
  addPnL: (amount: number) => Promise<void>;
  claimFaucet: () => Promise<boolean>;
  canClaimFaucet: () => boolean;
  getTimeUntilNextClaim: () => number;
}

const FAUCET_COOLDOWN = 24 * 60 * 60 * 1000; // 24 hours

export const useWalletDbStore = create<WalletDbStore>((set, get) => ({
  wallet: {
    points: 0,
    pnlRealized: 0,
  },
  loading: false,
  initialized: false,

  init: async () => {
    const { initialized } = get();
    if (initialized) return;

    await get().fetchWallet();
    set({ initialized: true });
  },

  fetchWallet: async () => {
    try {
      set({ loading: true });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        set({ 
          wallet: { points: 0, pnlRealized: 0 },
          loading: false 
        });
        return;
      }

      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        set({
          wallet: {
            id: data.id,
            points: Number(data.points),
            pnlRealized: Number(data.pnl_realized),
            lastFaucetClaim: data.last_faucet_claim,
          },
        });
      } else {
        // Create wallet if doesn't exist (shouldn't happen due to trigger)
        const { data: newWallet, error: createError } = await supabase
          .from('wallets')
          .insert({
            user_id: user.id,
            points: 10000,
            pnl_realized: 0,
          })
          .select()
          .single();

        if (createError) throw createError;

        set({
          wallet: {
            id: newWallet.id,
            points: Number(newWallet.points),
            pnlRealized: Number(newWallet.pnl_realized),
            lastFaucetClaim: newWallet.last_faucet_claim,
          },
        });
      }
    } catch (error: any) {
      console.error('Error fetching wallet:', error);
      toast.error('Failed to load wallet');
    } finally {
      set({ loading: false });
    }
  },

  addPoints: async (amount: number) => {
    const { wallet } = get();
    const newPoints = wallet.points + amount;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('wallets')
        .update({ points: newPoints })
        .eq('user_id', user.id);

      if (error) throw error;

      set({
        wallet: { ...wallet, points: newPoints },
      });
    } catch (error: any) {
      console.error('Error adding points:', error);
      toast.error('Failed to update points');
    }
  },

  subtractPoints: async (amount: number) => {
    const { wallet } = get();
    const newPoints = Math.max(0, wallet.points - amount);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('wallets')
        .update({ points: newPoints })
        .eq('user_id', user.id);

      if (error) throw error;

      set({
        wallet: { ...wallet, points: newPoints },
      });
    } catch (error: any) {
      console.error('Error subtracting points:', error);
      toast.error('Failed to update points');
    }
  },

  addPnL: async (amount: number) => {
    const { wallet } = get();
    const newPnL = wallet.pnlRealized + amount;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('wallets')
        .update({ pnl_realized: newPnL })
        .eq('user_id', user.id);

      if (error) throw error;

      set({
        wallet: { ...wallet, pnlRealized: newPnL },
      });
    } catch (error: any) {
      console.error('Error updating P&L:', error);
      toast.error('Failed to update P&L');
    }
  },

  claimFaucet: async () => {
    const { wallet, canClaimFaucet } = get();
    
    if (!canClaimFaucet()) {
      return false;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const newPoints = wallet.points + 10000;
      const now = new Date().toISOString();

      const { error } = await supabase
        .from('wallets')
        .update({ 
          points: newPoints,
          last_faucet_claim: now,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      set({
        wallet: { 
          ...wallet, 
          points: newPoints,
          lastFaucetClaim: now,
        },
      });

      return true;
    } catch (error: any) {
      console.error('Error claiming faucet:', error);
      toast.error('Failed to claim faucet');
      return false;
    }
  },

  canClaimFaucet: () => {
    const { wallet } = get();
    if (!wallet.lastFaucetClaim) return true;
    
    const lastClaim = new Date(wallet.lastFaucetClaim).getTime();
    const now = Date.now();
    return now - lastClaim >= FAUCET_COOLDOWN;
  },

  getTimeUntilNextClaim: () => {
    const { wallet } = get();
    if (!wallet.lastFaucetClaim) return 0;
    
    const lastClaim = new Date(wallet.lastFaucetClaim).getTime();
    const now = Date.now();
    const timeElapsed = now - lastClaim;
    return Math.max(0, FAUCET_COOLDOWN - timeElapsed);
  },
}));
