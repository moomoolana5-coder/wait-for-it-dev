-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Allow users to read their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Add verified column to submitted_tokens
ALTER TABLE public.submitted_tokens
ADD COLUMN verified BOOLEAN DEFAULT false;

-- Create verification_requests table
CREATE TABLE public.verification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_address TEXT NOT NULL,
  token_name TEXT NOT NULL,
  token_symbol TEXT NOT NULL,
  transaction_hash TEXT NOT NULL,
  wallet_address TEXT NOT NULL DEFAULT '0xd769A8183C7Fa2B5E351B051b727e496dAAcf5De',
  amount_usd DECIMAL DEFAULT 150,
  status TEXT DEFAULT 'pending',
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on verification_requests
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

-- Allow public to insert verification requests
CREATE POLICY "Anyone can submit verification request"
ON public.verification_requests
FOR INSERT
TO public
WITH CHECK (true);

-- Allow public to read verification requests
CREATE POLICY "Anyone can view verification requests"
ON public.verification_requests
FOR SELECT
TO public
USING (true);

-- Allow admins to update verification requests
CREATE POLICY "Admins can update verification requests"
ON public.verification_requests
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update submitted_tokens verification status
CREATE POLICY "Admins can verify tokens"
ON public.submitted_tokens
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));