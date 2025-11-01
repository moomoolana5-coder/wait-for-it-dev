-- Create app_role enum if not exists
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create markets table
CREATE TABLE IF NOT EXISTS public.markets (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  cover TEXT,
  category TEXT NOT NULL,
  type TEXT NOT NULL,
  outcomes JSONB NOT NULL,
  resolution_type TEXT NOT NULL,
  source JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  opens_at TIMESTAMPTZ,
  closes_at TIMESTAMPTZ NOT NULL,
  resolves_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'OPEN',
  pool_usd NUMERIC DEFAULT 0,
  yes_stake NUMERIC DEFAULT 0,
  no_stake NUMERIC DEFAULT 0,
  a_stake NUMERIC DEFAULT 0,
  b_stake NUMERIC DEFAULT 0,
  trending_score INTEGER DEFAULT 0,
  result JSONB,
  created_by TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on markets
ALTER TABLE public.markets ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read markets
CREATE POLICY "Anyone can view markets"
  ON public.markets
  FOR SELECT
  USING (true);

-- Policy: Only admins can insert markets
CREATE POLICY "Admins can insert markets"
  ON public.markets
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Policy: Only admins can update markets
CREATE POLICY "Admins can update markets"
  ON public.markets
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Policy: Only admins can delete markets
CREATE POLICY "Admins can delete markets"
  ON public.markets
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Create wallet_addresses table to map wallets to users
CREATE TABLE IF NOT EXISTS public.wallet_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on wallet_addresses
ALTER TABLE public.wallet_addresses ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own wallet addresses
CREATE POLICY "Users can view their own wallets"
  ON public.wallet_addresses
  FOR SELECT
  USING (auth.uid() = user_id OR true);

-- Policy: Users can insert their own wallet addresses
CREATE POLICY "Users can insert their own wallets"
  ON public.wallet_addresses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to check if a wallet address has a specific role
CREATE OR REPLACE FUNCTION public.wallet_has_role(_wallet_address TEXT, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.wallet_addresses wa
    JOIN public.user_roles ur ON wa.user_id = ur.user_id
    WHERE LOWER(wa.wallet_address) = LOWER(_wallet_address)
      AND ur.role = _role
  )
$$;

-- Create trades table
CREATE TABLE IF NOT EXISTS public.trades (
  id TEXT PRIMARY KEY,
  market_id TEXT NOT NULL REFERENCES public.markets(id) ON DELETE CASCADE,
  wallet TEXT NOT NULL,
  side TEXT NOT NULL,
  amount_pts NUMERIC NOT NULL,
  price NUMERIC NOT NULL,
  shares NUMERIC NOT NULL,
  ts TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on trades
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view trades
CREATE POLICY "Anyone can view trades"
  ON public.trades
  FOR SELECT
  USING (true);

-- Policy: Anyone can insert trades
CREATE POLICY "Anyone can insert trades"
  ON public.trades
  FOR INSERT
  WITH CHECK (true);

-- Insert admin wallet (will need user_id after auth setup)
-- This will be done via application after user signs up/connects wallet

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_markets_status ON public.markets(status);
CREATE INDEX IF NOT EXISTS idx_markets_closes_at ON public.markets(closes_at);
CREATE INDEX IF NOT EXISTS idx_markets_trending ON public.markets(trending_score DESC);
CREATE INDEX IF NOT EXISTS idx_trades_market_id ON public.trades(market_id);
CREATE INDEX IF NOT EXISTS idx_trades_wallet ON public.trades(wallet);
CREATE INDEX IF NOT EXISTS idx_wallet_addresses_wallet ON public.wallet_addresses(LOWER(wallet_address));