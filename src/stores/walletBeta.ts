import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface WalletState {
  id?: string;
  displayName?: string;
  points: number;
  pnlRealized: number;
  lastFaucetClaim?: string;
}

interface WalletBetaStore {
  wallet: WalletState;
  loading: boolean;
  initialized: boolean;
  init: (userId: string) => Promise<void>;
  fetchWallet: (userId: string) => Promise<void>;
  addPoints: (userId: string, amount: number) => Promise<void>;
  subtractPoints: (userId: string, amount: number) => Promise<void>;
  addPnL: (userId: string, amount: number) => Promise<void>;
  claimFaucet: (userId: string) => Promise<boolean>;
  canClaimFaucet: () => boolean;
  getTimeUntilNextClaim: () => number;
}

const FAUCET_COOLDOWN = 24 * 60 * 60 * 1000; // 24 hours

export const useWalletBetaStore = create<WalletBetaStore>((set, get) => ({
  wallet: {
    points: 0,
    pnlRealized: 0,
  },
  loading: false,
  initialized: false,

  init: async (userId: string) => {
    const { initialized } = get();
    if (initialized) return;

    await get().fetchWallet(userId);
    set({ initialized: true });
  },

  fetchWallet: async (userId: string) => {
    try {
      set({ loading: true });

      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (data) {
        set({
          wallet: {
            id: data.id,
            displayName: data.display_name || undefined,
            points: Number(data.points),
            pnlRealized: Number(data.pnl_realized),
            lastFaucetClaim: data.last_faucet_claim || undefined,
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

  addPoints: async (userId: string, amount: number) => {
    const { wallet } = get();
    const newPoints = wallet.points + amount;

    try {
      const { error } = await supabase
        .from('wallets')
        .update({ points: newPoints })
        .eq('id', userId);

      if (error) throw error;

      set({
        wallet: { ...wallet, points: newPoints },
      });
    } catch (error: any) {
      console.error('Error adding points:', error);
      toast.error('Failed to update points');
    }
  },

  subtractPoints: async (userId: string, amount: number) => {
    const { wallet } = get();
    const newPoints = Math.max(0, wallet.points - amount);

    try {
      const { error } = await supabase
        .from('wallets')
        .update({ points: newPoints })
        .eq('id', userId);

      if (error) throw error;

      set({
        wallet: { ...wallet, points: newPoints },
      });
    } catch (error: any) {
      console.error('Error subtracting points:', error);
      toast.error('Failed to update points');
    }
  },

  addPnL: async (userId: string, amount: number) => {
    const { wallet } = get();
    const newPnL = wallet.pnlRealized + amount;

    try {
      const { error } = await supabase
        .from('wallets')
        .update({ pnl_realized: newPnL })
        .eq('id', userId);

      if (error) throw error;

      set({
        wallet: { ...wallet, pnlRealized: newPnL },
      });
    } catch (error: any) {
      console.error('Error updating P&L:', error);
      toast.error('Failed to update P&L');
    }
  },

  claimFaucet: async (userId: string) => {
    const { wallet, canClaimFaucet } = get();
    
    if (!canClaimFaucet()) {
      return false;
    }

    try {
      const newPoints = wallet.points + 10000;
      const now = new Date().toISOString();

      const { error } = await supabase
        .from('wallets')
        .update({ 
          points: newPoints,
          last_faucet_claim: now,
        })
        .eq('id', userId);

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
