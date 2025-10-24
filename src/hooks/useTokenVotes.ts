import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useTokenVotes = (tokenAddress: string) => {
  const [voteCount, setVoteCount] = useState<number>(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Normalisasi alamat segera setelah hook dipanggil
  const normalizedAddress = tokenAddress.toLowerCase();

  // Get voter identifier (could be IP or session ID)
  const getVoterIdentifier = () => {
    let voterId = localStorage.getItem('voter_id');
    if (!voterId) {
      voterId = `voter_${crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(7)}`;
      localStorage.setItem('voter_id', voterId);
    }
    return voterId;
  };

  const fetchVoteCount = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('token_vote_counts')
        .select('vote_count')
        .eq('token_address', normalizedAddress)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching vote count from view:', error);
      }
      
      const countFromView = data?.vote_count || 0;
      
      if (countFromView === 0) {
        const { count, error: countError } = await supabase
          .from('token_votes')
          .select('*', { count: 'exact', head: true })
          .eq('token_address', normalizedAddress);
        
        if (countError) {
          console.error('Error counting votes directly:', countError);
          setVoteCount(0);
        } else {
          setVoteCount(count || 0);
        }
      } else {
        setVoteCount(countFromView);
      }
    } catch (error) {
      console.error('General error fetching vote count:', error);
      setVoteCount(0);
    }
  }, [normalizedAddress]);

  const checkHasVoted = useCallback(async () => {
    try {
      const voterId = getVoterIdentifier();
      
      const { data, error } = await supabase
        .from('token_votes')
        .select('id')
        .eq('token_address', normalizedAddress)
        .eq('voter_ip', voterId) 
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      setHasVoted(!!data);
    } catch (error) {
      console.error('Error checking vote status:', error);
      setHasVoted(false);
    } finally {
      setIsLoading(false);
    }
  }, [normalizedAddress]);

  useEffect(() => {
    fetchVoteCount();
    checkHasVoted();

    const channel = supabase
      .channel(`token-votes-${normalizedAddress}`) 
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'token_votes',
          filter: `token_address=eq.${normalizedAddress}`
        },
        () => {
          setTimeout(fetchVoteCount, 100); 
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [normalizedAddress, fetchVoteCount, checkHasVoted]);

  const vote = async (captchaValid: boolean) => {
    if (!captchaValid) {
      throw new Error('Please complete the captcha');
    }

    if (hasVoted) {
      throw new Error('You have already voted for this token');
    }

    // --- PERBAIKAN ESLINT DIMULAI DI SINI ---
    // Menghapus blok try/catch yang tidak perlu dan menghilangkan 'any'
    const voterId = getVoterIdentifier();
    
    // Insert vote
    const { error } = await supabase
      .from('token_votes')
      .insert({
        token_address: normalizedAddress,
        voter_ip: voterId
      });

    if (error) {
      // Menangani error duplikasi primary/unique key (sudah voted)
      if (error.code === '23505') {
        throw new Error('You have already voted for this token');
      }
      // Melempar error lainnya
      throw error;
    }
    
    // Set status pemilih menjadi true segera
    setHasVoted(true);
    
    // Realtime subscription akan menangani pembaruan voteCount
    // --- PERBAIKAN ESLINT BERAKHIR DI SINI ---
  };

  return { voteCount, hasVoted, isLoading, vote };
};