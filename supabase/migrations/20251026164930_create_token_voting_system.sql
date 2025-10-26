/*
  # Create Token Voting System with Bullish/Bearish

  1. New Tables
    - `token_votes`
      - `id` (uuid, primary key)
      - `token_address` (text, not null)
      - `voter_ip` (text, not null)
      - `vote_type` (text, not null) - 'bullish' or 'bearish'
      - `created_at` (timestamp with time zone)
      - Unique constraint on (token_address, voter_ip, vote_type)

    - `new_listing_tokens`
      - `id` (uuid, primary key)
      - `token_address` (text, unique, not null)
      - `created_at` (timestamp with time zone)

    - `submitted_tokens`
      - `id` (uuid, primary key)
      - `user_id` (text, not null)
      - `token_address` (text, not null)
      - `token_name` (text, not null)
      - `token_symbol` (text, not null)
      - `description` (text)
      - `website_url` (text)
      - `telegram_url` (text)
      - `twitter_url` (text)
      - `logo_url` (text)
      - `transaction_hash` (text, not null)
      - `status` (text, default 'pending')
      - `created_at` (timestamp with time zone)

  2. Views
    - `token_vote_counts` - Aggregates bullish, bearish, and total vote counts

  3. Security
    - Enable RLS on all tables
    - Add policies for public read access
    - Add policies for public insert
    
  4. Indexes
    - Index on created_at for new_listing_tokens
    - Index on token_address for token_votes
    - Index on voter_ip for token_votes
    - Index on status for submitted_tokens
*/

-- Create new_listing_tokens table
CREATE TABLE IF NOT EXISTS public.new_listing_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token_address TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create submitted_tokens table
CREATE TABLE IF NOT EXISTS public.submitted_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  token_address TEXT NOT NULL,
  token_name TEXT NOT NULL,
  token_symbol TEXT NOT NULL,
  description TEXT,
  website_url TEXT,
  telegram_url TEXT,
  twitter_url TEXT,
  logo_url TEXT,
  transaction_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  status TEXT DEFAULT 'pending'
);

-- Create token_votes table with vote_type
CREATE TABLE IF NOT EXISTS public.token_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token_address TEXT NOT NULL,
  voter_ip TEXT NOT NULL,
  vote_type TEXT NOT NULL DEFAULT 'bullish',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT token_votes_token_address_voter_ip_vote_type_key 
    UNIQUE(token_address, voter_ip, vote_type),
  CONSTRAINT vote_type_check CHECK (vote_type IN ('bullish', 'bearish'))
);

-- Create token_vote_counts view
CREATE OR REPLACE VIEW public.token_vote_counts 
WITH (security_invoker=true)
AS
SELECT 
  token_address,
  COUNT(*) FILTER (WHERE vote_type = 'bullish') AS bullish_count,
  COUNT(*) FILTER (WHERE vote_type = 'bearish') AS bearish_count,
  COUNT(*) AS total_vote_count
FROM public.token_votes
GROUP BY token_address;

-- Enable Row Level Security
ALTER TABLE public.new_listing_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submitted_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_votes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to new_listing_tokens" ON public.new_listing_tokens;
DROP POLICY IF EXISTS "Allow public read access to submitted_tokens" ON public.submitted_tokens;
DROP POLICY IF EXISTS "Allow public read access to token_votes" ON public.token_votes;
DROP POLICY IF EXISTS "Allow public insert to new_listing_tokens" ON public.new_listing_tokens;
DROP POLICY IF EXISTS "Allow public insert to submitted_tokens" ON public.submitted_tokens;
DROP POLICY IF EXISTS "Allow public insert to token_votes" ON public.token_votes;

-- Create RLS policies for public read access
CREATE POLICY "Allow public read access to new_listing_tokens"
  ON public.new_listing_tokens FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to submitted_tokens"
  ON public.submitted_tokens FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to token_votes"
  ON public.token_votes FOR SELECT
  USING (true);

-- Create RLS policies for insert
CREATE POLICY "Allow public insert to new_listing_tokens"
  ON public.new_listing_tokens FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public insert to submitted_tokens"
  ON public.submitted_tokens FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public insert to token_votes"
  ON public.token_votes FOR INSERT
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_new_listing_tokens_created_at ON public.new_listing_tokens(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_token_votes_address ON public.token_votes(token_address);
CREATE INDEX IF NOT EXISTS idx_token_votes_voter ON public.token_votes(voter_ip);
CREATE INDEX IF NOT EXISTS idx_submitted_tokens_status ON public.submitted_tokens(status);
CREATE INDEX IF NOT EXISTS idx_token_votes_type ON public.token_votes(vote_type);
