-- Fix security definer view warning by recreating as security invoker
DROP VIEW IF EXISTS public.referral_stats;

CREATE OR REPLACE VIEW public.referral_stats 
WITH (security_invoker = on)
AS
SELECT 
  referrer_wallet,
  referrer_user_id,
  referrer_code,
  COUNT(DISTINCT referee_user_id) as total_referrals,
  SUM(CASE WHEN bonus_claimed THEN referrer_bonus ELSE 0 END) as total_earned,
  SUM(CASE WHEN NOT bonus_claimed AND referee_user_id IS NOT NULL THEN referrer_bonus ELSE 0 END) as pending_earnings
FROM public.referrals
GROUP BY referrer_wallet, referrer_user_id, referrer_code;