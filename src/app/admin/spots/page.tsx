"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { logAuditAction } from "@/lib/audit";

interface Spot {
  id: string;
  name: string;
  city_id: string;
  types: string[];
  description: string;
  coordinates: number[];
  vibes: string[];
  google_maps_url: string | null;
  website_url: string | null;
  twitter_url: string | null;
  instagram_url: string | null;
  approved: boolean;
  created_at: string;
  updated_at: string;
}

interface AdminUser {
  role: "super_admin" | "city_admin";
  scope_values: string[];
}

export default function AdminSpotsPage() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "approved" | "pending">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [editForm, setEditForm] = useState<Partial<Spot>>({});
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminAndSpots();
  }, []);

  async function fetchAdminAndSpots() {
    const supabase = createClient();

    // Get current user's admin info
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: adminData } = await supabase
      .from("admin_users")
      .select("role, scope_values")
      .eq("user_id", user.id)
      .single();

    if (adminData) {
      setAdminUser(adminData);
    }

    // Fetch spots - scoped for city admins
    let query = supabase.from("spots").select("*").order("created_at", { ascending: false });

    // City admins only see their assigned cities
    if (adminData?.role === "city_admin" && adminData.scope_values.length > 0) {
      query = query.in("city_id", adminData.scope_values);
    }

    const { data, error } = await query;

    if (!error && data) {
      setSpots(data);
    }
    setLoading(false);
  }

  async function toggleApproval(spotId: string, currentStatus: boolean) {
    setError(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("spots")
      .update({ approved: !currentStatus })
      .eq("id", spotId);

    if (error) {
      setError("Failed to update approval status");
      return;
    }

    // Log audit action
    const spot = spots.find(s => s.id === spotId);
    await logAuditAction({
      action: currentStatus ? "spot_unapproved" : "spot_approved",
      target_type: "spot",
      target_id: spotId,
      old_value: { approved: currentStatus, name: spot?.name },
      new_value: { approved: !currentStatus },
    });

    setSpots(spots.map(s => s.id === spotId ? { ...s, approved: !currentStatus } : s));
  }

  async function handleEditSpot() {
    if (!selectedSpot) return;
    setProcessing(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase
      .from("spots")
      .update({
        name: editForm.name,
        description: editForm.description,
        types: editForm.types,
        vibes: editForm.vibes,
        google_maps_url: editForm.google_maps_url,
        website_url: editForm.website_url,
        twitter_url: editForm.twitter_url,
        instagram_url: editForm.instagram_url,
      })
      .eq("id", selectedSpot.id);

    if (error) {
      setError("Failed to update spot");
      setProcessing(false);
      return;
    }

    // Log audit action
    await logAuditAction({
      action: "spot_updated",
      target_type: "spot",
      target_id: selectedSpot.id,
      old_value: {
        name: selectedSpot.name,
        description: selectedSpot.description,
        types: selectedSpot.types,
        vibes: selectedSpot.vibes,
      },
      new_value: {
        name: editForm.name,
        description: editForm.description,
        types: editForm.types,
        vibes: editForm.vibes,
      },
    });

    setSpots(spots.map(s => s.id === selectedSpot.id ? { ...s, ...editForm } : s));
    setSelectedSpot(null);
    setEditForm({});
    setProcessing(false);
  }

  function openEditModal(spot: Spot) {
    setSelectedSpot(spot);
    setEditForm({
      name: spot.name,
      description: spot.description,
      types: spot.types,
      vibes: spot.vibes || [],
      google_maps_url: spot.google_maps_url,
      website_url: spot.website_url,
      twitter_url: spot.twitter_url,
      instagram_url: spot.instagram_url,
    });
  }

  async function handleDeleteSpot(spotId: string) {
    setProcessing(true);
    setError(null);

    const spot = spots.find(s => s.id === spotId);
    const supabase = createClient();
    const { error } = await supabase
      .from("spots")
      .delete()
      .eq("id", spotId);

    if (error) {
      setError("Failed to delete spot");
      setProcessing(false);
      return;
    }

    // Log audit action
    await logAuditAction({
      action: "spot_deleted",
      target_type: "spot",
      target_id: spotId,
      old_value: spot ? { name: spot.name, city_id: spot.city_id } : undefined,
    });

    setSpots(spots.filter(s => s.id !== spotId));
    setDeleteConfirm(null);
    setProcessing(false);
  }

  const filteredSpots = spots.filter(spot => {
    const matchesFilter = filter === "all" ||
      (filter === "approved" && spot.approved) ||
      (filter === "pending" && !spot.approved);
    const matchesSearch = spot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spot.city_id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-lime)]" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Spots</h1>
          <p className="text-[var(--text-secondary)] mt-1">
            {adminUser?.role === "city_admin"
              ? `Managing spots in: ${adminUser.scope_values.join(", ")}`
              : "Manage all spots across cities"}
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/15 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search spots..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-lime)]/50"
        />
        <div className="flex gap-2">
          {(["all", "approved", "pending"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? "bg-[var(--accent-lime)]/15 text-[var(--accent-lime)] border border-[var(--accent-lime)]/50"
                  : "bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border)] hover:border-[var(--border-hover)]"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Spots Table */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">City</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Types</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {filteredSpots.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-[var(--text-secondary)]">
                  No spots found
                </td>
              </tr>
            ) : (
              filteredSpots.map((spot) => (
                <tr key={spot.id} className="hover:bg-[var(--bg-card-hover)]">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-[var(--text-primary)]">{spot.name}</div>
                    <div className="text-xs text-[var(--text-muted)] truncate max-w-xs">{spot.description}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">{spot.city_id}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {spot.types.slice(0, 2).map((type) => (
                        <span key={type} className="px-2 py-0.5 bg-[var(--bg-dark)] text-[var(--text-secondary)] text-xs rounded">
                          {type}
                        </span>
                      ))}
                      {spot.types.length > 2 && (
                        <span className="px-2 py-0.5 text-[var(--text-muted)] text-xs">
                          +{spot.types.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      spot.approved
                        ? "bg-green-500/15 text-green-400"
                        : "bg-yellow-500/15 text-yellow-400"
                    }`}>
                      {spot.approved ? "Approved" : "Pending"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleApproval(spot.id, spot.approved)}
                        className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                          spot.approved
                            ? "bg-yellow-500/15 text-yellow-400 hover:bg-yellow-500/25"
                            : "bg-green-500/15 text-green-400 hover:bg-green-500/25"
                        }`}
                      >
                        {spot.approved ? "Unapprove" : "Approve"}
                      </button>
                      <button
                        onClick={() => openEditModal(spot)}
                        className="px-3 py-1 text-xs font-medium bg-[var(--bg-dark)] text-[var(--text-secondary)] rounded hover:text-[var(--text-primary)] transition-colors"
                      >
                        Edit
                      </button>
                      {adminUser?.role === "super_admin" && (
                        <button
                          onClick={() => setDeleteConfirm(spot.id)}
                          className="px-3 py-1 text-xs font-medium bg-red-500/15 text-red-400 rounded hover:bg-red-500/25 transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {selectedSpot && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
              Edit Spot
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Name</label>
                <input
                  type="text"
                  value={editForm.name || ""}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--bg-dark)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-lime)]/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Description</label>
                <textarea
                  value={editForm.description || ""}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-[var(--bg-dark)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-lime)]/50 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Types (comma separated)</label>
                <input
                  type="text"
                  value={(editForm.types || []).join(", ")}
                  onChange={(e) => setEditForm({ ...editForm, types: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })}
                  className="w-full px-3 py-2 bg-[var(--bg-dark)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-lime)]/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Vibes (comma separated)</label>
                <input
                  type="text"
                  value={(editForm.vibes || []).join(", ")}
                  onChange={(e) => setEditForm({ ...editForm, vibes: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })}
                  className="w-full px-3 py-2 bg-[var(--bg-dark)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-lime)]/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Google Maps URL</label>
                <input
                  type="text"
                  value={editForm.google_maps_url || ""}
                  onChange={(e) => setEditForm({ ...editForm, google_maps_url: e.target.value || null })}
                  className="w-full px-3 py-2 bg-[var(--bg-dark)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-lime)]/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Website URL</label>
                <input
                  type="text"
                  value={editForm.website_url || ""}
                  onChange={(e) => setEditForm({ ...editForm, website_url: e.target.value || null })}
                  className="w-full px-3 py-2 bg-[var(--bg-dark)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-lime)]/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Twitter URL</label>
                  <input
                    type="text"
                    value={editForm.twitter_url || ""}
                    onChange={(e) => setEditForm({ ...editForm, twitter_url: e.target.value || null })}
                    className="w-full px-3 py-2 bg-[var(--bg-dark)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-lime)]/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Instagram URL</label>
                  <input
                    type="text"
                    value={editForm.instagram_url || ""}
                    onChange={(e) => setEditForm({ ...editForm, instagram_url: e.target.value || null })}
                    className="w-full px-3 py-2 bg-[var(--bg-dark)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-lime)]/50"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleEditSpot}
                disabled={processing}
                className="flex-1 px-4 py-2 bg-[var(--brand-lime)] hover:bg-[var(--brand-lime)]/90 text-[#0a0a0b] rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {processing ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={() => { setSelectedSpot(null); setEditForm({}); }}
                className="px-4 py-2 bg-[var(--bg-dark)] text-[var(--text-secondary)] rounded-lg font-semibold transition-colors hover:text-[var(--text-primary)]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
              Delete Spot
            </h2>
            <p className="text-[var(--text-secondary)] mb-2">
              Are you sure you want to delete this spot?
            </p>
            <p className="text-sm text-red-400 mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              This action cannot be undone. All reviews and upvotes associated with this spot will also be deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDeleteSpot(deleteConfirm)}
                disabled={processing}
                className="flex-1 px-4 py-2 bg-red-500/15 hover:bg-red-500/25 text-red-400 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {processing ? "Deleting..." : "Delete Spot"}
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 bg-[var(--bg-dark)] text-[var(--text-secondary)] rounded-lg font-semibold transition-colors hover:text-[var(--text-primary)]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
