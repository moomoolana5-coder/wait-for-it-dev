import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useTokenVotes = (tokenAddress: string) => {
  const [voteCount, setVoteCount] = useState<number>(0);
  const [bullishVotes, setBullishVotes] = useState<number>(0);
  const [bearishVotes, setBearishVotes] = useState<number>(0);
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
        .select('total_votes, bullish_votes, bearish_votes')
        .eq('token_address', normalizedAddress)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching vote count from view:', error);
      }
      
      if (data) {
        setVoteCount(data.total_votes || 0);
        setBullishVotes(data.bullish_votes || 0);
        setBearishVotes(data.bearish_votes || 0);
      } else {
        // Fallback: count directly from token_votes
        const { data: votes, error: countError } = await supabase
          .from('token_votes')
          .select('vote_type')
          .eq('token_address', normalizedAddress);
        
        if (countError) {
          console.error('Error counting votes directly:', countError);
          setVoteCount(0);
          setBullishVotes(0);
          setBearishVotes(0);
        } else {
          const bullish = votes?.filter(v => v.vote_type === 'bullish').length || 0;
          const bearish = votes?.filter(v => v.vote_type === 'bearish').length || 0;
          setVoteCount(bullish + bearish);
          setBullishVotes(bullish);
          setBearishVotes(bearish);
        }
      }
    } catch (error) {
      console.error('General error fetching vote count:', error);
      setVoteCount(0);
      setBullishVotes(0);
      setBearishVotes(0);
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

  const vote = async (captchaValid: boolean, voteType: 'bullish' | 'bearish') => {
    if (!captchaValid) {
      throw new Error('Please complete the captcha');
    }

    if (hasVoted) {
      throw new Error('You have already voted for this token');
    }

    const voterId = getVoterIdentifier();
    
    // Insert vote with vote_type
    const { error } = await supabase
      .from('token_votes')
      .insert({
        token_address: normalizedAddress,
        voter_ip: voterId,
        vote_type: voteType
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
  };

  return { voteCount, bullishVotes, bearishVotes, hasVoted, isLoading, vote };
};