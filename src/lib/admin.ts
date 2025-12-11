import { createClient } from "@/lib/supabase/server";

export interface AdminUser {
  id: string;
  user_id: string;
  role: "super_admin" | "city_admin";
  scope_type: "global" | "city";
  scope_values: string[];
  status: "active" | "inactive" | "suspended";
  created_at: string;
}

/**
 * Check if the current user is an admin
 * Returns the admin record if they are, null otherwise
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Check if user is in admin_users table
  const { data: adminUser, error } = await supabase
    .from("admin_users")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active")
    .single();

  if (error || !adminUser) {
    return null;
  }

  return adminUser as AdminUser;
}

/**
 * Check if user is a super admin
 */
export async function isSuperAdmin(): Promise<boolean> {
  const admin = await getAdminUser();
  return admin?.role === "super_admin";
}

/**
 * Check if user can manage a specific city
 */
export async function canManageCity(cityId: string): Promise<boolean> {
  const admin = await getAdminUser();

  if (!admin) return false;
  if (admin.role === "super_admin") return true;
  if (admin.role === "city_admin" && admin.scope_values.includes(cityId)) return true;

  return false;
}

/**
 * Get pending counts for admin dashboard
 */
export async function getAdminPendingCounts() {
  const supabase = await createClient();

  const [nominations, cityRequests, spotReports, adminApplications, deletionRequests] =
    await Promise.all([
      supabase.from("nominations").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("city_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("spot_reports").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("admin_applications").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("deletion_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
    ]);

  return {
    nominations: nominations.count || 0,
    cityRequests: cityRequests.count || 0,
    spotReports: spotReports.count || 0,
    adminApplications: adminApplications.count || 0,
    deletionRequests: deletionRequests.count || 0,
  };
}
