import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { supabase } from '@/integrations/supabase/client';

export const useWalletAdmin = () => {
  const { address, isConnected } = useAccount();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!address || !isConnected) {
        setIsAdmin(false);
        setLoading(false);
        setRegistered(false);
        return;
      }

      setLoading(true);

      try {
        // First, try to register/check wallet
        const { data, error } = await supabase.functions.invoke('register-admin-wallet', {
          body: { wallet_address: address },
        });

        if (error) {
          console.error('Error checking wallet:', error);
          setIsAdmin(false);
          setRegistered(false);
        } else {
          console.log('Wallet check result:', data);
          setIsAdmin(data.is_admin || false);
          setRegistered(true);
        }
      } catch (error) {
        console.error('Error in wallet admin check:', error);
        setIsAdmin(false);
        setRegistered(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [address, isConnected]);

  return { isAdmin, loading, registered, walletAddress: address };
};