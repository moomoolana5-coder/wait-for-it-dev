-- Fix the security definer view by recreating it with SECURITY INVOKER
DROP VIEW IF EXISTS public.token_vote_counts;

CREATE VIEW public.token_vote_counts 
WITH (security_invoker=true)
AS
SELECT 
  token_address,
  COUNT(*) AS vote_count
FROM public.token_votes
GROUP BY token_address;