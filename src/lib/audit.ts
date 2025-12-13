import { createClient } from "@/lib/supabase/client";

export type AuditAction =
  | "spot_created"
  | "spot_updated"
  | "spot_deleted"
  | "spot_approved"
  | "spot_unapproved"
  | "nomination_approved"
  | "nomination_rejected"
  | "report_resolved"
  | "report_dismissed"
  | "city_request_approved"
  | "city_request_rejected"
  | "admin_application_approved"
  | "admin_application_rejected"
  | "deletion_request_approved"
  | "deletion_request_rejected"
  | "admin_status_changed"
  | "admin_removed";

export interface AuditLogEntry {
  action: AuditAction;
  target_type?: string;
  target_id?: string;
  old_value?: Record<string, unknown>;
  new_value?: Record<string, unknown>;
}

/**
 * Log an admin action to the audit log
 */
export async function logAuditAction(entry: AuditLogEntry): Promise<void> {
  try {
    const supabase = createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("No user found for audit log");
      return;
    }

    const { error } = await supabase.from("admin_audit_log").insert({
      admin_id: user.id,
      action: entry.action,
      target_type: entry.target_type,
      target_id: entry.target_id,
      old_value: entry.old_value,
      new_value: entry.new_value,
    });

    if (error) {
      console.error("Failed to log audit action:", error);
    }
  } catch (err) {
    console.error("Audit log error:", err);
  }
}
