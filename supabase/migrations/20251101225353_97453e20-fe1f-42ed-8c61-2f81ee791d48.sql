-- Fix token_vote_counts view security definer warning
DROP VIEW IF EXISTS public.token_vote_counts;

CREATE OR REPLACE VIEW public.token_vote_counts
WITH (security_invoker = on)
AS
SELECT 
  token_address,
  COUNT(*) AS total_votes,
  COUNT(*) FILTER (WHERE vote_type = 'bullish') AS bullish_votes,
  COUNT(*) FILTER (WHERE vote_type = 'bearish') AS bearish_votes
FROM public.token_votes
GROUP BY token_address;