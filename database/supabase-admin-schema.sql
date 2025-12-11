-- BuilderMaps Admin Panel Schema
-- Run this SQL in your Supabase SQL Editor to add admin functionality

-- =====================================================
-- ADMIN USERS TABLE (must be created first - other tables reference it)
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_users (
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

CREATE INDEX IF NOT EXISTS idx_admin_users_user ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_status ON admin_users(status);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view admin users" ON admin_users;
DROP POLICY IF EXISTS "Super admins can insert admin users" ON admin_users;
DROP POLICY IF EXISTS "Super admins can update admin users" ON admin_users;
DROP POLICY IF EXISTS "Super admins can delete admin users" ON admin_users;

CREATE POLICY "Admins can view admin users" ON admin_users FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM admin_users WHERE status = 'active'));

CREATE POLICY "Super admins can insert admin users" ON admin_users FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_users WHERE status = 'active' AND role = 'super_admin'));

CREATE POLICY "Super admins can update admin users" ON admin_users FOR UPDATE
  USING (auth.uid() IN (SELECT user_id FROM admin_users WHERE status = 'active' AND role = 'super_admin'));

CREATE POLICY "Super admins can delete admin users" ON admin_users FOR DELETE
  USING (auth.uid() IN (SELECT user_id FROM admin_users WHERE status = 'active' AND role = 'super_admin'));

DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- =====================================================
-- SPOTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS spots (
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

CREATE INDEX IF NOT EXISTS idx_spots_city ON spots(city_id);
CREATE INDEX IF NOT EXISTS idx_spots_approved ON spots(approved);

ALTER TABLE spots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Approved spots are viewable by everyone" ON spots;
DROP POLICY IF EXISTS "Admins can insert spots" ON spots;
DROP POLICY IF EXISTS "Admins can update spots" ON spots;
DROP POLICY IF EXISTS "Super admins can delete spots" ON spots;

CREATE POLICY "Approved spots are viewable by everyone" ON spots FOR SELECT
  USING (approved = true OR auth.uid() IN (SELECT user_id FROM admin_users WHERE status = 'active'));

CREATE POLICY "Admins can insert spots" ON spots FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_users WHERE status = 'active'));

CREATE POLICY "Admins can update spots" ON spots FOR UPDATE
  USING (auth.uid() IN (SELECT user_id FROM admin_users WHERE status = 'active'));

CREATE POLICY "Super admins can delete spots" ON spots FOR DELETE
  USING (auth.uid() IN (SELECT user_id FROM admin_users WHERE status = 'active' AND role = 'super_admin'));

DROP TRIGGER IF EXISTS update_spots_updated_at ON spots;
CREATE TRIGGER update_spots_updated_at BEFORE UPDATE ON spots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- =====================================================
-- ADMIN APPLICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_applications (
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

CREATE INDEX IF NOT EXISTS idx_admin_applications_status ON admin_applications(status);
CREATE INDEX IF NOT EXISTS idx_admin_applications_user ON admin_applications(user_id);

ALTER TABLE admin_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own applications" ON admin_applications;
DROP POLICY IF EXISTS "Authenticated users can apply" ON admin_applications;
DROP POLICY IF EXISTS "Super admins can update applications" ON admin_applications;

CREATE POLICY "Users can view own applications" ON admin_applications FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() IN (SELECT user_id FROM admin_users WHERE status = 'active' AND role = 'super_admin'));

CREATE POLICY "Authenticated users can apply" ON admin_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Super admins can update applications" ON admin_applications FOR UPDATE
  USING (auth.uid() IN (SELECT user_id FROM admin_users WHERE status = 'active' AND role = 'super_admin'));

DROP TRIGGER IF EXISTS update_admin_applications_updated_at ON admin_applications;
CREATE TRIGGER update_admin_applications_updated_at BEFORE UPDATE ON admin_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- =====================================================
-- SPOT REPORTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS spot_reports (
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

CREATE INDEX IF NOT EXISTS idx_spot_reports_spot ON spot_reports(spot_id);
CREATE INDEX IF NOT EXISTS idx_spot_reports_status ON spot_reports(status);

ALTER TABLE spot_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can report spots" ON spot_reports;
DROP POLICY IF EXISTS "Users can view own reports, admins can view all" ON spot_reports;
DROP POLICY IF EXISTS "Admins can update reports" ON spot_reports;

CREATE POLICY "Authenticated users can report spots" ON spot_reports FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view own reports, admins can view all" ON spot_reports FOR SELECT
  USING (auth.uid() = reported_by OR auth.uid() IN (SELECT user_id FROM admin_users WHERE status = 'active'));

CREATE POLICY "Admins can update reports" ON spot_reports FOR UPDATE
  USING (auth.uid() IN (SELECT user_id FROM admin_users WHERE status = 'active'));


-- =====================================================
-- DELETION REQUESTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS deletion_requests (
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

CREATE INDEX IF NOT EXISTS idx_deletion_requests_status ON deletion_requests(status);
CREATE INDEX IF NOT EXISTS idx_deletion_requests_type ON deletion_requests(target_type);

ALTER TABLE deletion_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "City admins can request deletions" ON deletion_requests;
DROP POLICY IF EXISTS "Admins can view deletion requests" ON deletion_requests;
DROP POLICY IF EXISTS "Super admins can update deletion requests" ON deletion_requests;

CREATE POLICY "City admins can request deletions" ON deletion_requests FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_users WHERE status = 'active'));

CREATE POLICY "Admins can view deletion requests" ON deletion_requests FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM admin_users WHERE status = 'active'));

CREATE POLICY "Super admins can update deletion requests" ON deletion_requests FOR UPDATE
  USING (auth.uid() IN (SELECT user_id FROM admin_users WHERE status = 'active' AND role = 'super_admin'));


-- =====================================================
-- ADMIN AUDIT LOG TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_audit_log (
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

CREATE INDEX IF NOT EXISTS idx_audit_log_admin ON admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON admin_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON admin_audit_log(created_at);

ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Super admins can view audit log" ON admin_audit_log;
DROP POLICY IF EXISTS "Admins can insert audit log" ON admin_audit_log;

CREATE POLICY "Super admins can view audit log" ON admin_audit_log FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM admin_users WHERE status = 'active' AND role = 'super_admin'));

CREATE POLICY "Admins can insert audit log" ON admin_audit_log FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_users WHERE status = 'active'));


-- =====================================================
-- UPDATE EXISTING TABLES
-- =====================================================
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_provider_check;
ALTER TABLE reviews ADD CONSTRAINT reviews_provider_check CHECK (provider IN ('twitter', 'linkedin', 'x'));

ALTER TABLE nominations ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES users(id);

ALTER TABLE city_requests
  ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS notes TEXT;


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
-- VIEW FOR DASHBOARD
-- =====================================================
CREATE OR REPLACE VIEW admin_pending_counts AS
SELECT
  (SELECT COUNT(*) FROM nominations WHERE status = 'pending') as pending_nominations,
  (SELECT COUNT(*) FROM city_requests WHERE status = 'pending') as pending_city_requests,
  (SELECT COUNT(*) FROM spot_reports WHERE status = 'pending') as pending_reports,
  (SELECT COUNT(*) FROM admin_applications WHERE status = 'pending') as pending_applications,
  (SELECT COUNT(*) FROM deletion_requests WHERE status = 'pending') as pending_deletions;
