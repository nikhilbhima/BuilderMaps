"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface AdminUser {
  id: string;
  user_id: string;
  role: "super_admin" | "city_admin";
  scope_type: "global" | "city";
  scope_values: string[];
  status: "active" | "inactive" | "suspended";
  created_at: string;
  user?: {
    handle: string;
    display_name: string | null;
  };
}

export default function AdminTeamPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  async function fetchAdmins() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("admin_users")
      .select(`
        *,
        user:users(handle, display_name)
      `)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setAdmins(data);
    }
    setLoading(false);
  }

  async function updateStatus(admin: AdminUser, newStatus: AdminUser["status"]) {
    setProcessing(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("admin_users")
      .update({ status: newStatus })
      .eq("id", admin.id);

    if (!error) {
      setAdmins(admins.map(a => a.id === admin.id ? { ...a, status: newStatus } : a));
      setSelectedAdmin(null);
    }
    setProcessing(false);
  }

  async function removeAdmin(admin: AdminUser) {
    setProcessing(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("admin_users")
      .delete()
      .eq("id", admin.id);

    if (!error) {
      setAdmins(admins.filter(a => a.id !== admin.id));
      setSelectedAdmin(null);
    }
    setProcessing(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-lime)]" />
      </div>
    );
  }

  const superAdmins = admins.filter(a => a.role === "super_admin");
  const cityAdmins = admins.filter(a => a.role === "city_admin");

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Admin Team</h1>
        <p className="text-[var(--text-secondary)] mt-1">Manage admin users and their permissions</p>
      </div>

      {/* Super Admins */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
          Super Admins ({superAdmins.length})
        </h2>
        <div className="space-y-3">
          {superAdmins.length === 0 ? (
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 text-center text-[var(--text-secondary)]">
              No super admins found
            </div>
          ) : (
            superAdmins.map((admin) => (
              <div
                key={admin.id}
                className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[var(--accent-lime)]/20 flex items-center justify-center">
                    <span className="text-[var(--accent-lime)] font-semibold">
                      {admin.user?.handle?.[0]?.toUpperCase() || "?"}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[var(--text-primary)]">
                        @{admin.user?.handle || "Unknown"}
                      </span>
                      <span className="px-2 py-0.5 bg-purple-500/15 text-purple-400 text-xs font-medium rounded">
                        Super Admin
                      </span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                        admin.status === "active" ? "bg-green-500/15 text-green-400" :
                        admin.status === "inactive" ? "bg-gray-500/15 text-gray-400" :
                        "bg-red-500/15 text-red-400"
                      }`}>
                        {admin.status}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">Global access</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* City Admins */}
      <div>
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
          City Admins ({cityAdmins.length})
        </h2>
        <div className="space-y-3">
          {cityAdmins.length === 0 ? (
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 text-center text-[var(--text-secondary)]">
              No city admins found
            </div>
          ) : (
            cityAdmins.map((admin) => (
              <div
                key={admin.id}
                className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[var(--border)] flex items-center justify-center">
                    <span className="text-[var(--text-secondary)] font-semibold">
                      {admin.user?.handle?.[0]?.toUpperCase() || "?"}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[var(--text-primary)]">
                        @{admin.user?.handle || "Unknown"}
                      </span>
                      <span className="px-2 py-0.5 bg-blue-500/15 text-blue-400 text-xs font-medium rounded">
                        City Admin
                      </span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                        admin.status === "active" ? "bg-green-500/15 text-green-400" :
                        admin.status === "inactive" ? "bg-gray-500/15 text-gray-400" :
                        "bg-red-500/15 text-red-400"
                      }`}>
                        {admin.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {admin.scope_values.map((city) => (
                        <span key={city} className="px-2 py-0.5 bg-[var(--bg-dark)] text-[var(--text-muted)] text-xs rounded">
                          {city}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAdmin(admin)}
                  className="px-3 py-1.5 bg-[var(--bg-dark)] text-[var(--text-secondary)] rounded-lg text-sm font-medium hover:text-[var(--text-primary)] transition-colors"
                >
                  Manage
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Manage Modal */}
      {selectedAdmin && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
              Manage @{selectedAdmin.user?.handle}
            </h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-muted)]">Role</span>
                <span className="text-[var(--text-primary)]">{selectedAdmin.role}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-muted)]">Status</span>
                <span className="text-[var(--text-primary)]">{selectedAdmin.status}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-muted)]">Cities</span>
                <span className="text-[var(--text-primary)]">
                  {selectedAdmin.scope_type === "global" ? "All" : selectedAdmin.scope_values.join(", ")}
                </span>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <p className="text-sm font-medium text-[var(--text-primary)]">Change Status</p>
              <div className="flex gap-2">
                {(["active", "inactive", "suspended"] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => updateStatus(selectedAdmin, status)}
                    disabled={processing || selectedAdmin.status === status}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                      status === "active" ? "bg-green-500/15 text-green-400 hover:bg-green-500/25" :
                      status === "inactive" ? "bg-gray-500/15 text-gray-400 hover:bg-gray-500/25" :
                      "bg-red-500/15 text-red-400 hover:bg-red-500/25"
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => removeAdmin(selectedAdmin)}
                disabled={processing}
                className="flex-1 px-4 py-2 bg-red-500/15 hover:bg-red-500/25 text-red-400 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                Remove Admin
              </button>
              <button
                onClick={() => setSelectedAdmin(null)}
                className="px-4 py-2 bg-[var(--bg-dark)] text-[var(--text-secondary)] rounded-lg font-semibold transition-colors hover:text-[var(--text-primary)]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
