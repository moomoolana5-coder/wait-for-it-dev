-- Fix search_path for security functions by recreating with proper settings

-- Drop and recreate update_wallet_updated_at function
CREATE OR REPLACE FUNCTION public.update_wallet_updated_at()
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

-- Drop and recreate handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.wallets (user_id, points, pnl_realized)
  VALUES (NEW.id, 10000, 0);
  RETURN NEW;
END;
$$;