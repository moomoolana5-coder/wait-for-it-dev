import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useTokenVotes = (tokenAddress: string) => {
  const [bullishCount, setBullishCount] = useState<number>(0);
  const [bearishCount, setBearishCount] = useState<number>(0);
  const [hasBullishVoted, setHasBullishVoted] = useState(false);
  const [hasBearishVoted, setHasBearishVoted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
        .select('bullish_count, bearish_count')
        .eq('token_address', normalizedAddress)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching vote count from view:', error);
      }

      setBullishCount(data?.bullish_count || 0);
      setBearishCount(data?.bearish_count || 0);
    } catch (error) {
      console.error('General error fetching vote count:', error);
      setBullishCount(0);
      setBearishCount(0);
    }
  }, [normalizedAddress]);

  const checkHasVoted = useCallback(async () => {
    try {
      const voterId = getVoterIdentifier();

      const { data: bullishData } = await supabase
        .from('token_votes')
        .select('id')
        .eq('token_address', normalizedAddress)
        .eq('voter_ip', voterId)
        .eq('vote_type', 'bullish')
        .maybeSingle();

      const { data: bearishData } = await supabase
        .from('token_votes')
        .select('id')
        .eq('token_address', normalizedAddress)
        .eq('voter_ip', voterId)
        .eq('vote_type', 'bearish')
        .maybeSingle();

      setHasBullishVoted(!!bullishData);
      setHasBearishVoted(!!bearishData);
    } catch (error) {
      console.error('Error checking vote status:', error);
      setHasBullishVoted(false);
      setHasBearishVoted(false);
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

    const hasAlreadyVoted = voteType === 'bullish' ? hasBullishVoted : hasBearishVoted;
    if (hasAlreadyVoted) {
      throw new Error(`You have already voted ${voteType} for this token`);
    }

    const voterId = getVoterIdentifier();

    const { error } = await supabase
      .from('token_votes')
      .insert({
        token_address: normalizedAddress,
        voter_ip: voterId,
        vote_type: voteType
      });

    if (error) {
      if (error.code === '23505') {
        throw new Error(`You have already voted ${voteType} for this token`);
      }
      throw error;
    }

    if (voteType === 'bullish') {
      setHasBullishVoted(true);
    } else {
      setHasBearishVoted(true);
    }
  };

  return { bullishCount, bearishCount, hasBullishVoted, hasBearishVoted, isLoading, vote };
};