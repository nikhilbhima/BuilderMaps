-- BuilderMaps Supabase Schema
-- Run this SQL in your Supabase SQL Editor to set up the database

-- =====================================================
-- USERS TABLE
-- Stores user profile information synced from OAuth
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  handle TEXT NOT NULL,
  display_name TEXT,
  provider TEXT NOT NULL CHECK (provider IN ('twitter', 'linkedin')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_handle ON users(handle);

-- RLS Policies for users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Anyone can view user profiles
CREATE POLICY "Users are viewable by everyone"
  ON users FOR SELECT
  USING (true);

-- Users can only insert their own record
CREATE POLICY "Users can insert own record"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can only update their own record
CREATE POLICY "Users can update own record"
  ON users FOR UPDATE
  USING (auth.uid() = id);


-- =====================================================
-- UPVOTES TABLE
-- Tracks which users have upvoted which spots
-- =====================================================
CREATE TABLE IF NOT EXISTS upvotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  spot_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, spot_id)
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_upvotes_user ON upvotes(user_id);
CREATE INDEX IF NOT EXISTS idx_upvotes_spot ON upvotes(spot_id);

-- RLS Policies for upvotes
ALTER TABLE upvotes ENABLE ROW LEVEL SECURITY;

-- Anyone can view upvotes (for counting)
CREATE POLICY "Upvotes are viewable by everyone"
  ON upvotes FOR SELECT
  USING (true);

-- Authenticated users can add upvotes
CREATE POLICY "Authenticated users can upvote"
  ON upvotes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only remove their own upvotes
CREATE POLICY "Users can remove own upvotes"
  ON upvotes FOR DELETE
  USING (auth.uid() = user_id);


-- =====================================================
-- REVIEWS TABLE
-- Stores user reviews for spots
-- =====================================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  spot_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text TEXT NOT NULL CHECK (char_length(text) >= 10 AND char_length(text) <= 500),
  author_handle TEXT NOT NULL,
  author_name TEXT,
  provider TEXT CHECK (provider IN ('twitter', 'linkedin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reviews_spot ON reviews(spot_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);

-- RLS Policies for reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can view reviews
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (true);

-- Authenticated users can add reviews
CREATE POLICY "Authenticated users can review"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own reviews
CREATE POLICY "Users can delete own reviews"
  ON reviews FOR DELETE
  USING (auth.uid() = user_id);


-- =====================================================
-- NOMINATIONS TABLE
-- Stores spot nominations submitted by users
-- =====================================================
CREATE TABLE IF NOT EXISTS nominations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(name) >= 2 AND char_length(name) <= 100),
  city_id TEXT NOT NULL,
  types TEXT[] NOT NULL,
  description TEXT NOT NULL CHECK (char_length(description) >= 10 AND char_length(description) <= 1000),
  vibes TEXT[] DEFAULT '{}',
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  google_maps_url TEXT,
  website_url TEXT,
  twitter_handle TEXT,
  instagram_handle TEXT,
  linkedin_url TEXT,
  luma_url TEXT,
  custom_links JSONB DEFAULT '[]',
  submitted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_nominations_status ON nominations(status);
CREATE INDEX IF NOT EXISTS idx_nominations_city ON nominations(city_id);

-- RLS Policies for nominations
ALTER TABLE nominations ENABLE ROW LEVEL SECURITY;

-- Anyone can submit nominations
CREATE POLICY "Anyone can submit nominations"
  ON nominations FOR INSERT
  WITH CHECK (true);

-- Users can view their own nominations
CREATE POLICY "Users can view own nominations"
  ON nominations FOR SELECT
  USING (auth.uid() = submitted_by OR auth.uid() IN (
    SELECT id FROM users WHERE handle IN ('nikhilbhima') -- Admin list
  ));

-- Only admins can update nominations (for approval)
CREATE POLICY "Admins can update nominations"
  ON nominations FOR UPDATE
  USING (auth.uid() IN (
    SELECT id FROM users WHERE handle IN ('nikhilbhima') -- Admin list
  ));


-- =====================================================
-- CITY REQUESTS TABLE
-- Stores requests for new cities
-- =====================================================
CREATE TABLE IF NOT EXISTS city_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_name TEXT NOT NULL CHECK (char_length(city_name) >= 2 AND char_length(city_name) <= 100),
  requested_by UUID REFERENCES users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(city_name)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_city_requests_status ON city_requests(status);

-- RLS Policies for city_requests
ALTER TABLE city_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can submit city requests
CREATE POLICY "Anyone can request cities"
  ON city_requests FOR INSERT
  WITH CHECK (true);

-- Users can view all requests (for duplicate checking)
CREATE POLICY "City requests are viewable"
  ON city_requests FOR SELECT
  USING (true);


-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nominations_updated_at
  BEFORE UPDATE ON nominations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- =====================================================
-- VIEWS (Optional - for analytics)
-- =====================================================

-- View for spot upvote counts
CREATE OR REPLACE VIEW spot_upvote_counts AS
SELECT
  spot_id,
  COUNT(*) as upvote_count
FROM upvotes
GROUP BY spot_id;

-- View for spot review stats
CREATE OR REPLACE VIEW spot_review_stats AS
SELECT
  spot_id,
  COUNT(*) as review_count,
  AVG(rating)::NUMERIC(2,1) as avg_rating
FROM reviews
GROUP BY spot_id;
