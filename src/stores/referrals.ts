import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

export type Referral = {
  id: string;
  referrerUserId?: string;
  referrerWallet: string;
  referrerCode: string;
  refereeUserId?: string | null;
  refereeWallet?: string | null;
  bonusClaimed: boolean;
  referrerBonus: number;
  refereeBonus: number;
  createdAt: string;
};

export type ReferralStats = {
  referrerWallet: string;
  referrerUserId?: string;
  referrerCode: string;
  totalReferrals: number;
  totalEarned: number;
  pendingEarnings: number;
};

type ReferralsStore = {
  referralCode: string | null;
  referrals: Referral[];
  stats: ReferralStats | null;
  initialized: boolean;
  loading: boolean;
  init: (walletAddress: string) => Promise<void>;
  generateReferralCode: (walletAddress: string, userId?: string) => Promise<string>;
  getReferralStats: (walletAddress: string) => Promise<ReferralStats | null>;
  trackReferral: (referrerCode: string, refereeWallet: string, refereeUserId?: string) => Promise<void>;
  claimReferralBonus: (walletAddress: string, referralId: string) => Promise<number>;
};

export const useReferralsStore = create<ReferralsStore>((set, get) => ({
  referralCode: null,
  referrals: [],
  stats: null,
  initialized: false,
  loading: false,

  init: async (walletAddress: string) => {
    if (get().initialized) return;
    
    set({ loading: true });
    
    try {
      // Get or create referral code
      const { data: existingReferral } = await supabase
        .from('referrals')
        .select('referrer_code')
        .eq('referrer_wallet', walletAddress)
        .limit(1)
        .single();

      if (existingReferral) {
        set({ referralCode: existingReferral.referrer_code });
      }

      // Get referral stats
      const stats = await get().getReferralStats(walletAddress);
      
      set({ stats, initialized: true, loading: false });
    } catch (error) {
      console.error('Error loading referrals:', error);
      set({ loading: false, initialized: true });
    }
  },

  generateReferralCode: async (walletAddress: string, userId?: string) => {
    try {
      // Check if code already exists
      const { data: existing } = await supabase
        .from('referrals')
        .select('referrer_code')
        .eq('referrer_wallet', walletAddress)
        .limit(1)
        .single();

      if (existing) {
        set({ referralCode: existing.referrer_code });
        return existing.referrer_code;
      }

      // Generate new code using database function
      const { data: codeData, error: codeError } = await supabase
        .rpc('generate_referral_code');

      if (codeError) throw codeError;

      const newCode = codeData as string;

      // Create initial referral record
      const { error } = await supabase
        .from('referrals')
        .insert({
          referrer_user_id: userId,
          referrer_wallet: walletAddress,
          referrer_code: newCode,
          referee_user_id: null,
          referee_wallet: null,
          bonus_claimed: false
        });

      if (error) throw error;

      set({ referralCode: newCode });
      return newCode;
    } catch (error) {
      console.error('Error generating referral code:', error);
      throw error;
    }
  },

  getReferralStats: async (walletAddress: string) => {
    try {
      const { data, error } = await supabase
        .from('referral_stats')
        .select('*')
        .eq('referrer_wallet', walletAddress)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No stats found
          return null;
        }
        throw error;
      }

      const stats: ReferralStats = {
        referrerWallet: data.referrer_wallet,
        referrerUserId: data.referrer_user_id,
        referrerCode: data.referrer_code,
        totalReferrals: data.total_referrals || 0,
        totalEarned: data.total_earned || 0,
        pendingEarnings: data.pending_earnings || 0
      };

      set({ stats });
      return stats;
    } catch (error) {
      console.error('Error getting referral stats:', error);
      return null;
    }
  },

  trackReferral: async (referrerCode: string, refereeWallet: string, refereeUserId?: string) => {
    try {
      // Find referrer by code
      const { data: referrer, error: findError } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_code', referrerCode)
        .limit(1)
        .single();

      if (findError || !referrer) {
        console.error('Referrer code not found:', referrerCode);
        return;
      }

      // Create new referral record
      const { error } = await supabase
        .from('referrals')
        .insert({
          referrer_user_id: referrer.referrer_user_id,
          referrer_wallet: referrer.referrer_wallet,
          referrer_code: referrerCode,
          referee_user_id: refereeUserId,
          referee_wallet: refereeWallet,
          bonus_claimed: false,
          referrer_bonus: 500,
          referee_bonus: 1000
        });

      if (error) throw error;

      console.log('Referral tracked successfully');
    } catch (error) {
      console.error('Error tracking referral:', error);
    }
  },

  claimReferralBonus: async (walletAddress: string, referralId: string) => {
    try {
      // Mark as claimed
      const { error } = await supabase
        .from('referrals')
        .update({ bonus_claimed: true })
        .eq('id', referralId)
        .eq('referrer_wallet', walletAddress);

      if (error) throw error;

      // Refresh stats
      await get().getReferralStats(walletAddress);

      return 500; // Return referrer bonus amount
    } catch (error) {
      console.error('Error claiming referral bonus:', error);
      throw error;
    }
  }
}));
