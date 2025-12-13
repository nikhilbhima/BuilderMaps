-- BuilderMaps Database Optimizations
-- Run this SQL in your Supabase SQL Editor

-- =====================================================
-- 1. ADD MISSING INDEXES
-- =====================================================

-- Index for counting upvotes by spot
CREATE INDEX IF NOT EXISTS idx_upvotes_spot ON upvotes(spot_id);

-- Index for fetching user's upvotes
CREATE INDEX IF NOT EXISTS idx_upvotes_user ON upvotes(user_id);

-- Composite index for upvote lookups
CREATE INDEX IF NOT EXISTS idx_upvotes_user_spot ON upvotes(user_id, spot_id);

-- Index for reviews by spot
CREATE INDEX IF NOT EXISTS idx_reviews_spot ON reviews(spot_id);

-- Index for reviews by user
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);


-- =====================================================
-- 2. CREATE UPVOTE COUNTS VIEW
-- =====================================================

-- Drop if exists to recreate
DROP VIEW IF EXISTS spot_upvote_counts;

-- Create materialized-like view for upvote counts
CREATE VIEW spot_upvote_counts AS
SELECT
  spot_id,
  COUNT(*) as upvote_count
FROM upvotes
GROUP BY spot_id;

-- Grant access to the view
GRANT SELECT ON spot_upvote_counts TO authenticated;
GRANT SELECT ON spot_upvote_counts TO anon;


-- =====================================================
-- 3. ADD CASCADE DELETE FOR SPOTS
-- =====================================================

-- First, drop existing constraints if they exist
ALTER TABLE upvotes DROP CONSTRAINT IF EXISTS upvotes_spot_id_fkey;
ALTER TABLE upvotes DROP CONSTRAINT IF EXISTS fk_upvotes_spot;
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_spot_id_fkey;
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS fk_reviews_spot;

-- Add cascade delete constraints
-- Note: This assumes spot_id is TEXT type matching spots.id
ALTER TABLE upvotes
  ADD CONSTRAINT fk_upvotes_spot
  FOREIGN KEY (spot_id) REFERENCES spots(id) ON DELETE CASCADE;

ALTER TABLE reviews
  ADD CONSTRAINT fk_reviews_spot
  FOREIGN KEY (spot_id) REFERENCES spots(id) ON DELETE CASCADE;


-- =====================================================
-- 4. CREATE FUNCTION FOR EFFICIENT UPVOTE COUNT
-- =====================================================

-- Function to get upvote count for a single spot
CREATE OR REPLACE FUNCTION get_spot_upvote_count(p_spot_id TEXT)
RETURNS INTEGER AS $$
BEGIN
  RETURN COALESCE(
    (SELECT COUNT(*)::INTEGER FROM upvotes WHERE spot_id = p_spot_id),
    0
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get all upvote counts (more efficient than fetching all rows)
CREATE OR REPLACE FUNCTION get_all_upvote_counts()
RETURNS TABLE(spot_id TEXT, count INTEGER) AS $$
BEGIN
  RETURN QUERY
  SELECT u.spot_id, COUNT(*)::INTEGER as count
  FROM upvotes u
  GROUP BY u.spot_id;
END;
$$ LANGUAGE plpgsql STABLE;


-- =====================================================
-- 5. ADD UPDATED_AT CHECK FOR USER SYNC
-- =====================================================

-- Add index on users.updated_at for sync optimization
CREATE INDEX IF NOT EXISTS idx_users_updated_at ON users(updated_at);
