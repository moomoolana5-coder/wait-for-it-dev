-- Create positions table to track user positions in markets
CREATE TABLE IF NOT EXISTS public.positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  market_id TEXT NOT NULL,
  side TEXT NOT NULL, -- YES/NO/A/B
  shares NUMERIC NOT NULL DEFAULT 0,
  cost_basis NUMERIC NOT NULL DEFAULT 0,
  claimed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(wallet_address, market_id, side)
);

-- Create earnings table to track all types of earnings
CREATE TABLE IF NOT EXISTS public.earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  earning_type TEXT NOT NULL, -- MARKET_WIN, REFERRAL_BONUS, MARKET_CREATOR_FEE, etc
  amount_pts NUMERIC NOT NULL,
  source_id TEXT, -- market_id, referral_id, etc
  metadata JSONB,
  claimed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create referrals table for referral system
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  referrer_wallet TEXT NOT NULL,
  referrer_code TEXT UNIQUE NOT NULL,
  referee_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  referee_wallet TEXT,
  bonus_claimed BOOLEAN NOT NULL DEFAULT false,
  referrer_bonus NUMERIC NOT NULL DEFAULT 500, -- Bonus for referrer
  referee_bonus NUMERIC NOT NULL DEFAULT 1000, -- Bonus for referee
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create referral_stats view for easy querying
CREATE OR REPLACE VIEW public.referral_stats AS
SELECT 
  referrer_wallet,
  referrer_user_id,
  referrer_code,
  COUNT(DISTINCT referee_user_id) as total_referrals,
  SUM(CASE WHEN bonus_claimed THEN referrer_bonus ELSE 0 END) as total_earned,
  SUM(CASE WHEN NOT bonus_claimed AND referee_user_id IS NOT NULL THEN referrer_bonus ELSE 0 END) as pending_earnings
FROM public.referrals
GROUP BY referrer_wallet, referrer_user_id, referrer_code;

-- Enable RLS on positions
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own positions"
ON public.positions FOR SELECT
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert their own positions"
ON public.positions FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own positions"
ON public.positions FOR UPDATE
USING (auth.uid() = user_id OR user_id IS NULL);

-- Enable RLS on earnings
ALTER TABLE public.earnings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own earnings"
ON public.earnings FOR SELECT
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Anyone can insert earnings"
ON public.earnings FOR INSERT
WITH CHECK (true);

-- Enable RLS on referrals
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view referrals they're involved in"
ON public.referrals FOR SELECT
USING (auth.uid() = referrer_user_id OR auth.uid() = referee_user_id);

CREATE POLICY "Anyone can insert referrals"
ON public.referrals FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their own referrals"
ON public.referrals FOR UPDATE
USING (auth.uid() = referrer_user_id);

-- Create indexes for performance
CREATE INDEX idx_positions_wallet ON public.positions(wallet_address);
CREATE INDEX idx_positions_market ON public.positions(market_id);
CREATE INDEX idx_earnings_wallet ON public.earnings(wallet_address);
CREATE INDEX idx_earnings_type ON public.earnings(earning_type);
CREATE INDEX idx_referrals_code ON public.referrals(referrer_code);
CREATE INDEX idx_referrals_referrer ON public.referrals(referrer_wallet);

-- Create function to generate unique referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 8 character alphanumeric code
    new_code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.referrals WHERE referrer_code = new_code) INTO code_exists;
    
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$;

-- Create trigger to update positions updated_at
CREATE OR REPLACE FUNCTION public.update_position_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_positions_updated_at
BEFORE UPDATE ON public.positions
FOR EACH ROW
EXECUTE FUNCTION public.update_position_updated_at();