-- Add vote_type column to token_votes table
ALTER TABLE token_votes ADD COLUMN vote_type text NOT NULL DEFAULT 'bullish';

-- Add check constraint for vote_type
ALTER TABLE token_votes ADD CONSTRAINT vote_type_check CHECK (vote_type IN ('bullish', 'bearish'));

-- Drop existing view
DROP VIEW IF EXISTS token_vote_counts;

-- Create updated view with separate bullish and bearish counts
CREATE VIEW token_vote_counts AS
SELECT 
  token_address,
  COUNT(*) as total_votes,
  COUNT(*) FILTER (WHERE vote_type = 'bullish') as bullish_votes,
  COUNT(*) FILTER (WHERE vote_type = 'bearish') as bearish_votes
FROM token_votes
GROUP BY token_address;