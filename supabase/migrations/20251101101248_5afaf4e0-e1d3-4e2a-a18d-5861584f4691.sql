-- Add display_name column to wallets for beta test accounts
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Allow null user_id for beta test accounts
ALTER TABLE public.wallets ALTER COLUMN user_id DROP NOT NULL;

-- Update wallets RLS policies to allow beta test users without auth
DROP POLICY IF EXISTS "Users can view their own wallet" ON public.wallets;
CREATE POLICY "Users can view their own wallet"
ON public.wallets
FOR SELECT
USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can insert their own wallet" ON public.wallets;
DROP POLICY IF EXISTS "Beta test users can insert wallet" ON public.wallets;
CREATE POLICY "Beta test users can insert wallet"
ON public.wallets
FOR INSERT
WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own wallet" ON public.wallets;
CREATE POLICY "Users can update their own wallet"
ON public.wallets
FOR UPDATE
USING (auth.uid() = user_id OR user_id IS NULL);

-- Update trades table to allow beta test without user_id
ALTER TABLE public.trades ALTER COLUMN user_id DROP NOT NULL;

-- Update trades RLS for beta test
DROP POLICY IF EXISTS "Users can view their own trades" ON public.trades;
DROP POLICY IF EXISTS "Anyone can view trades" ON public.trades;
CREATE POLICY "Anyone can view trades"
ON public.trades
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Users can insert their own trades" ON public.trades;
DROP POLICY IF EXISTS "Anyone can insert trades" ON public.trades;
CREATE POLICY "Anyone can insert trades"
ON public.trades
FOR INSERT
WITH CHECK (true);