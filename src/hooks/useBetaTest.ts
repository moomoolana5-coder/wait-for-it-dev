import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BetaTestUser {
  id: string;
  displayName: string;
  points: number;
  pnlRealized: number;
}

const BETA_USER_KEY = 'beta_test_user';

export const useBetaTest = () => {
  const [user, setUser] = useState<BetaTestUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage
    const stored = localStorage.getItem(BETA_USER_KEY);
    if (stored) {
      try {
        const userData = JSON.parse(stored);
        setUser(userData);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem(BETA_USER_KEY);
      }
    }
    setLoading(false);
  }, []);

  const createAccount = async (displayName: string): Promise<{ error: any }> => {
    try {
      setLoading(true);
      
      // Validate name
      const trimmedName = displayName.trim();
      if (trimmedName.length < 2) {
        throw new Error('Name must be at least 2 characters');
      }
      if (trimmedName.length > 50) {
        throw new Error('Name must be less than 50 characters');
      }

      // Create wallet in database
      const { data, error } = await supabase
        .from('wallets')
        .insert({
          display_name: trimmedName,
          points: 10000,
          pnl_realized: 0,
          user_id: null,
        })
        .select()
        .single();

      if (error) throw error;

      const userData: BetaTestUser = {
        id: data.id,
        displayName: trimmedName,
        points: Number(data.points),
        pnlRealized: Number(data.pnl_realized),
      };

      // Store in localStorage
      localStorage.setItem(BETA_USER_KEY, JSON.stringify(userData));
      setUser(userData);

      toast.success(`Welcome ${trimmedName}! You have 10,000 points to start trading.`);
      return { error: null };
    } catch (error: any) {
      console.error('Error creating account:', error);
      toast.error(error.message || 'Failed to create account');
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    localStorage.removeItem(BETA_USER_KEY);
    setUser(null);
    toast.success('Signed out successfully');
  };

  return {
    user,
    loading,
    createAccount,
    signOut,
  };
};
