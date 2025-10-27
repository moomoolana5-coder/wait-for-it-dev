-- Fix security definer view by recreating without SECURITY DEFINER
DROP VIEW IF EXISTS token_vote_counts;

CREATE VIEW token_vote_counts AS
SELECT 
  token_address,
  COUNT(*) as total_votes,
  COUNT(*) FILTER (WHERE vote_type = 'bullish') as bullish_votes,
  COUNT(*) FILTER (WHERE vote_type = 'bearish') as bearish_votes
FROM token_votes
GROUP BY token_address;