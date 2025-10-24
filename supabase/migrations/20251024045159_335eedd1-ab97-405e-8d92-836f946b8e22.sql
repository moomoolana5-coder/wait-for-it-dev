-- Create new_listing_tokens table
CREATE TABLE public.new_listing_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token_address TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create submitted_tokens table
CREATE TABLE public.submitted_tokens (
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
  status TEXT DEFAULT 'pending'::text
);

-- Create token_votes table
CREATE TABLE public.token_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token_address TEXT NOT NULL,
  voter_ip TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(token_address, voter_ip)
);

-- Create token_vote_counts view
CREATE VIEW public.token_vote_counts AS
SELECT 
  token_address,
  COUNT(*) AS vote_count
FROM public.token_votes
GROUP BY token_address;

-- Enable Row Level Security
ALTER TABLE public.new_listing_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submitted_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_votes ENABLE ROW LEVEL SECURITY;

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
CREATE INDEX idx_new_listing_tokens_created_at ON public.new_listing_tokens(created_at DESC);
CREATE INDEX idx_token_votes_address ON public.token_votes(token_address);
CREATE INDEX idx_token_votes_voter ON public.token_votes(voter_ip);
CREATE INDEX idx_submitted_tokens_status ON public.submitted_tokens(status);