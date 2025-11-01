-- Update markets RLS policies to work with wallet-based authentication
DROP POLICY IF EXISTS "Admins can insert markets" ON public.markets;
DROP POLICY IF EXISTS "Admins can update markets" ON public.markets;
DROP POLICY IF EXISTS "Admins can delete markets" ON public.markets;

-- Create new policies that check wallet address
CREATE POLICY "Admins can insert markets"
ON public.markets
FOR INSERT
WITH CHECK (
  wallet_has_role(created_by, 'admin'::app_role)
  OR EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'admin'::app_role
  )
);

CREATE POLICY "Admins can update markets"
ON public.markets
FOR UPDATE
USING (
  wallet_has_role(created_by, 'admin'::app_role)
  OR EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'admin'::app_role
  )
);

CREATE POLICY "Admins can delete markets"
ON public.markets
FOR DELETE
USING (
  wallet_has_role(created_by, 'admin'::app_role)
  OR EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'admin'::app_role
  )
);

-- Update storage policies for market covers
DROP POLICY IF EXISTS "Admins can upload market cover images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete market cover images" ON storage.objects;

-- Allow public uploads (we'll control this in the app)
CREATE POLICY "Anyone can upload market cover images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'market-covers');

CREATE POLICY "Anyone can delete market cover images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'market-covers');