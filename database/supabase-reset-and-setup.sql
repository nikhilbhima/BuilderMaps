-- BuilderMaps Complete Database Reset & Setup
-- WARNING: This will DELETE ALL DATA. Only run if you want to start fresh.

-- =====================================================
-- DROP EVERYTHING (in correct order due to dependencies)
-- =====================================================

-- Drop views first
DROP VIEW IF EXISTS admin_pending_counts CASCADE;
DROP VIEW IF EXISTS spot_review_stats CASCADE;
DROP VIEW IF EXISTS spot_upvote_counts CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS is_admin(UUID) CASCADE;
DROP FUNCTION IF EXISTS is_super_admin(UUID) CASCADE;
DROP FUNCTION IF EXISTS can_manage_city(UUID, TEXT) CASCADE;

-- Drop admin tables (no dependencies on other tables)
DROP TABLE IF EXISTS admin_audit_log CASCADE;
DROP TABLE IF EXISTS deletion_requests CASCADE;
DROP TABLE IF EXISTS spot_reports CASCADE;
DROP TABLE IF EXISTS admin_applications CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS spots CASCADE;

-- Drop main tables
DROP TABLE IF EXISTS city_requests CASCADE;
DROP TABLE IF EXISTS nominations CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS upvotes CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop trigger function
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;


-- =====================================================
-- CREATE EVERYTHING FROM SCRATCH
-- =====================================================

-- Helper function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  handle TEXT NOT NULL,
  display_name TEXT,
  provider TEXT NOT NULL CHECK (provider IN ('twitter', 'linkedin', 'x')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_handle ON users(handle);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users are viewable by everyone" ON users FOR SELECT USING (true);
CREATE POLICY "Users can insert own record" ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own record" ON users FOR UPDATE USING (auth.uid() = id);

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- =====================================================
-- ADMIN USERS TABLE (must come before other admin tables)
-- =====================================================
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'city_admin')),
  scope_type TEXT NOT NULL CHECK (scope_type IN ('global', 'city')),
  scope_values TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_admin_users_user ON admin_users(user_id);
CREATE INDEX idx_admin_users_status ON admin_users(status);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view admin users" ON admin_users FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM admin_users WHERE status = 'active'));
CREATE POLICY "Super admins can insert admin users" ON admin_users FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_users WHERE status = 'active' AND role = 'super_admin'));
CREATE POLICY "Super admins can update admin users" ON admin_users FOR UPDATE
  USING (auth.uid() IN (SELECT user_id FROM admin_users WHERE status = 'active' AND role = 'super_admin'));
CREATE POLICY "Super admins can delete admin users" ON admin_users FOR DELETE
  USING (auth.uid() IN (SELECT user_id FROM admin_users WHERE status = 'active' AND role = 'super_admin'));

CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- =====================================================
-- UPVOTES TABLE
-- =====================================================
CREATE TABLE upvotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  spot_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, spot_id)
);

CREATE INDEX idx_upvotes_user ON upvotes(user_id);
CREATE INDEX idx_upvotes_spot ON upvotes(spot_id);

ALTER TABLE upvotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Upvotes are viewable by everyone" ON upvotes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can upvote" ON upvotes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own upvotes" ON upvotes FOR DELETE USING (auth.uid() = user_id);


-- =====================================================
-- REVIEWS TABLE
-- =====================================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  spot_id TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  text TEXT NOT NULL CHECK (char_length(text) >= 1 AND char_length(text) <= 500),
  author_handle TEXT NOT NULL,
  author_name TEXT,
  provider TEXT CHECK (provider IN ('twitter', 'linkedin', 'x')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reviews_spot ON reviews(spot_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are viewable by everyone" ON reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can review" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON reviews FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- =====================================================
-- NOMINATIONS TABLE
-- =====================================================
CREATE TABLE nominations (
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
  submitted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  reviewed_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_nominations_status ON nominations(status);
CREATE INDEX idx_nominations_city ON nominations(city_id);

ALTER TABLE nominations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit nominations" ON nominations FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own nominations" ON nominations FOR SELECT
  USING (auth.uid() = submitted_by OR auth.uid() IN (SELECT user_id FROM admin_users WHERE status = 'active'));
CREATE POLICY "Admins can update nominations" ON nominations FOR UPDATE
  USING (auth.uid() IN (SELECT user_id FROM admin_users WHERE status = 'active'));

CREATE TRIGGER update_nominations_updated_at BEFORE UPDATE ON nominations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- =====================================================
-- CITY REQUESTS TABLE
-- =====================================================
CREATE TABLE city_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_name TEXT NOT NULL CHECK (char_length(city_name) >= 2 AND char_length(city_name) <= 100),
  requested_by UUID REFERENCES users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(city_name)
);

CREATE INDEX idx_city_requests_status ON city_requests(status);

ALTER TABLE city_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can request cities" ON city_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "City requests are viewable" ON city_requests FOR SELECT USING (true);


-- =====================================================
-- SPOTS TABLE
-- =====================================================
CREATE TABLE spots (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL CHECK (char_length(name) >= 2 AND char_length(name) <= 100),
  city_id TEXT NOT NULL,
  types TEXT[] NOT NULL,
  description TEXT NOT NULL CHECK (char_length(description) >= 10 AND char_length(description) <= 1000),
  coordinates DOUBLE PRECISION[] NOT NULL,
  vibes TEXT[] DEFAULT '{}',
  google_maps_url TEXT,
  luma_url TEXT,
  website_url TEXT,
  twitter_url TEXT,
  instagram_url TEXT,
  linkedin_url TEXT,
  added_by TEXT NOT NULL,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_spots_city ON spots(city_id);
CREATE INDEX idx_spots_approved ON spots(approved);

ALTER TABLE spots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved spots are viewable by everyone" ON spots FOR SELECT
  USING (approved = true OR auth.uid() IN (SELECT user_id FROM admin_users WHERE status = 'active'));
CREATE POLICY "Admins can insert spots" ON spots FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_users WHERE status = 'active'));
CREATE POLICY "Admins can update spots" ON spots FOR UPDATE
  USING (auth.uid() IN (SELECT user_id FROM admin_users WHERE status = 'active'));
CREATE POLICY "Super admins can delete spots" ON spots FOR DELETE
  USING (auth.uid() IN (SELECT user_id FROM admin_users WHERE status = 'active' AND role = 'super_admin'));

CREATE TRIGGER update_spots_updated_at BEFORE UPDATE ON spots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- =====================================================
-- ADMIN APPLICATIONS TABLE
-- =====================================================
CREATE TABLE admin_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  requested_cities TEXT[] NOT NULL,
  reason TEXT NOT NULL CHECK (char_length(reason) >= 20 AND char_length(reason) <= 1000),
  social_proof TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_admin_applications_status ON admin_applications(status);
CREATE INDEX idx_admin_applications_user ON admin_applications(user_id);

ALTER TABLE admin_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own applications" ON admin_applications FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() IN (SELECT user_id FROM admin_users WHERE status = 'active' AND role = 'super_admin'));
CREATE POLICY "Authenticated users can apply" ON admin_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Super admins can update applications" ON admin_applications FOR UPDATE
  USING (auth.uid() IN (SELECT user_id FROM admin_users WHERE status = 'active' AND role = 'super_admin'));

CREATE TRIGGER update_admin_applications_updated_at BEFORE UPDATE ON admin_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- =====================================================
-- SPOT REPORTS TABLE
-- =====================================================
CREATE TABLE spot_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_id TEXT NOT NULL,
  reported_by UUID REFERENCES users(id) ON DELETE SET NULL,
  report_type TEXT NOT NULL CHECK (report_type IN (
    'wrong_address', 'permanently_closed', 'temporarily_closed',
    'wrong_info', 'fake_spam', 'duplicate', 'other'
  )),
  details TEXT CHECK (char_length(details) <= 500),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  resolved_by UUID REFERENCES users(id),
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_spot_reports_spot ON spot_reports(spot_id);
CREATE INDEX idx_spot_reports_status ON spot_reports(status);

ALTER TABLE spot_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can report spots" ON spot_reports FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can view own reports, admins can view all" ON spot_reports FOR SELECT
  USING (auth.uid() = reported_by OR auth.uid() IN (SELECT user_id FROM admin_users WHERE status = 'active'));
CREATE POLICY "Admins can update reports" ON spot_reports FOR UPDATE
  USING (auth.uid() IN (SELECT user_id FROM admin_users WHERE status = 'active'));


-- =====================================================
-- DELETION REQUESTS TABLE
-- =====================================================
CREATE TABLE deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requested_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('spot', 'review', 'nomination')),
  target_id TEXT NOT NULL,
  reason TEXT NOT NULL CHECK (char_length(reason) >= 10 AND char_length(reason) <= 500),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_deletion_requests_status ON deletion_requests(status);
CREATE INDEX idx_deletion_requests_type ON deletion_requests(target_type);

ALTER TABLE deletion_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "City admins can request deletions" ON deletion_requests FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_users WHERE status = 'active'));
CREATE POLICY "Admins can view deletion requests" ON deletion_requests FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM admin_users WHERE status = 'active'));
CREATE POLICY "Super admins can update deletion requests" ON deletion_requests FOR UPDATE
  USING (auth.uid() IN (SELECT user_id FROM admin_users WHERE status = 'active' AND role = 'super_admin'));


-- =====================================================
-- ADMIN AUDIT LOG TABLE
-- =====================================================
CREATE TABLE admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES users(id),
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  old_value JSONB,
  new_value JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_log_admin ON admin_audit_log(admin_id);
CREATE INDEX idx_audit_log_action ON admin_audit_log(action);
CREATE INDEX idx_audit_log_created ON admin_audit_log(created_at);

ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can view audit log" ON admin_audit_log FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM admin_users WHERE status = 'active' AND role = 'super_admin'));
CREATE POLICY "Admins can insert audit log" ON admin_audit_log FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_users WHERE status = 'active'));


-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================
CREATE OR REPLACE FUNCTION is_admin(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM admin_users WHERE user_id = check_user_id AND status = 'active');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_super_admin(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM admin_users WHERE user_id = check_user_id AND status = 'active' AND role = 'super_admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION can_manage_city(check_user_id UUID, check_city_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = check_user_id AND status = 'active'
    AND (role = 'super_admin' OR (role = 'city_admin' AND check_city_id = ANY(scope_values)))
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =====================================================
-- VIEWS
-- =====================================================
CREATE OR REPLACE VIEW spot_upvote_counts AS
SELECT spot_id, COUNT(*) as upvote_count FROM upvotes GROUP BY spot_id;

CREATE OR REPLACE VIEW spot_review_stats AS
SELECT spot_id, COUNT(*) as review_count, AVG(rating)::NUMERIC(2,1) as avg_rating
FROM reviews GROUP BY spot_id;

CREATE OR REPLACE VIEW admin_pending_counts AS
SELECT
  (SELECT COUNT(*) FROM nominations WHERE status = 'pending') as pending_nominations,
  (SELECT COUNT(*) FROM city_requests WHERE status = 'pending') as pending_city_requests,
  (SELECT COUNT(*) FROM spot_reports WHERE status = 'pending') as pending_reports,
  (SELECT COUNT(*) FROM admin_applications WHERE status = 'pending') as pending_applications,
  (SELECT COUNT(*) FROM deletion_requests WHERE status = 'pending') as pending_deletions;


-- =====================================================
-- DONE! Now log in to the app with X/LinkedIn, then run:
--
-- SELECT id, handle FROM users WHERE handle = 'nikhilbhima';
--
-- Then insert yourself as super admin with that ID:
--
-- INSERT INTO admin_users (user_id, role, scope_type)
-- VALUES ('your-uuid-from-above', 'super_admin', 'global');
-- =====================================================
