"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface Nomination {
  id: string;
  name: string;
  city_id: string;
  types: string[];
  description: string;
  vibes: string[];
  lat: number | null;
  lng: number | null;
  google_maps_url: string | null;
  website_url: string | null;
  twitter_handle: string | null;
  instagram_handle: string | null;
  linkedin_url: string | null;
  submitted_by: string | null;
  status: "pending" | "approved" | "rejected";
  admin_notes: string | null;
  created_at: string;
}

interface AdminUser {
  role: "super_admin" | "city_admin";
  scope_values: string[];
}

export default function AdminNominationsPage() {
  const [nominations, setNominations] = useState<Nomination[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [selectedNomination, setSelectedNomination] = useState<Nomination | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [processing, setProcessing] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNominations();
  }, []);

  async function fetchNominations() {
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

    // Fetch nominations - scoped for city admins
    let query = supabase.from("nominations").select("*").order("created_at", { ascending: false });

    // City admins only see nominations for their assigned cities
    if (adminData?.role === "city_admin" && adminData.scope_values.length > 0) {
      query = query.in("city_id", adminData.scope_values);
    }

    const { data, error } = await query;

    if (!error && data) {
      setNominations(data);
    }
    setLoading(false);
  }

  async function handleApprove(nomination: Nomination) {
    setProcessing(true);
    const supabase = createClient();

    // Create spot from nomination
    const spotId = nomination.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "");

    const { error: spotError } = await supabase.from("spots").insert({
      id: `${nomination.city_id}-${spotId}-${Date.now()}`,
      name: nomination.name,
      city_id: nomination.city_id,
      types: nomination.types,
      description: nomination.description,
      coordinates: nomination.lat && nomination.lng ? [nomination.lng, nomination.lat] : [0, 0],
      vibes: nomination.vibes || [],
      google_maps_url: nomination.google_maps_url,
      website_url: nomination.website_url,
      twitter_url: nomination.twitter_handle ? `https://x.com/${nomination.twitter_handle}` : null,
      instagram_url: nomination.instagram_handle ? `https://instagram.com/${nomination.instagram_handle}` : null,
      linkedin_url: nomination.linkedin_url,
      added_by: "admin",
      approved: true,
    });

    if (spotError) {
      console.error("Failed to create spot:", spotError);
      setProcessing(false);
      return;
    }

    // Update nomination status
    const { error } = await supabase
      .from("nominations")
      .update({ status: "approved", admin_notes: adminNotes || null })
      .eq("id", nomination.id);

    if (!error) {
      setNominations(nominations.map(n => n.id === nomination.id ? { ...n, status: "approved" } : n));
      setSelectedNomination(null);
      setAdminNotes("");
    }
    setProcessing(false);
  }

  async function handleReject(nomination: Nomination) {
    setProcessing(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("nominations")
      .update({ status: "rejected", admin_notes: adminNotes || null })
      .eq("id", nomination.id);

    if (!error) {
      setNominations(nominations.map(n => n.id === nomination.id ? { ...n, status: "rejected" } : n));
      setSelectedNomination(null);
      setAdminNotes("");
    }
    setProcessing(false);
  }

  const filteredNominations = nominations.filter(n =>
    filter === "all" || n.status === filter
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-lime)]" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Nominations</h1>
        <p className="text-[var(--text-secondary)] mt-1">Review and approve spot nominations</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {(["pending", "approved", "rejected", "all"] as const).map((f) => (
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
            {f === "pending" && nominations.filter(n => n.status === "pending").length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 bg-[var(--accent-lime)] text-[#0a0a0b] text-xs rounded-full">
                {nominations.filter(n => n.status === "pending").length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Nominations List */}
      <div className="space-y-4">
        {filteredNominations.length === 0 ? (
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-12 text-center text-[var(--text-secondary)]">
            No nominations found
          </div>
        ) : (
          filteredNominations.map((nomination) => (
            <div
              key={nomination.id}
              className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">{nomination.name}</h3>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                      nomination.status === "pending" ? "bg-yellow-500/15 text-yellow-400" :
                      nomination.status === "approved" ? "bg-green-500/15 text-green-400" :
                      "bg-red-500/15 text-red-400"
                    }`}>
                      {nomination.status}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] mb-3">{nomination.description}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-2 py-1 bg-[var(--bg-dark)] text-[var(--text-secondary)] text-xs rounded">
                      {nomination.city_id}
                    </span>
                    {nomination.types.map((type) => (
                      <span key={type} className="px-2 py-1 bg-[var(--bg-dark)] text-[var(--text-secondary)] text-xs rounded">
                        {type}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs text-[var(--text-muted)]">
                    {nomination.google_maps_url && (
                      <a href={nomination.google_maps_url} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent-lime)]">
                        Google Maps
                      </a>
                    )}
                    {nomination.website_url && (
                      <a href={nomination.website_url} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent-lime)]">
                        Website
                      </a>
                    )}
                    {nomination.twitter_handle && (
                      <a href={`https://x.com/${nomination.twitter_handle}`} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent-lime)]">
                        @{nomination.twitter_handle}
                      </a>
                    )}
                  </div>
                </div>
                {nomination.status === "pending" && (
                  <button
                    onClick={() => setSelectedNomination(nomination)}
                    className="px-4 py-2 bg-[var(--brand-lime)] hover:bg-[var(--brand-lime)]/90 text-[#0a0a0b] rounded-lg text-sm font-semibold transition-colors"
                  >
                    Review
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Review Modal */}
      {selectedNomination && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl max-w-lg w-full p-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
              Review: {selectedNomination.name}
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              {selectedNomination.description}
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Admin Notes (optional)
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add notes about this decision..."
                rows={3}
                className="w-full px-4 py-2 bg-[var(--bg-dark)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-lime)]/50 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleApprove(selectedNomination)}
                disabled={processing}
                className="flex-1 px-4 py-2 bg-green-500/15 hover:bg-green-500/25 text-green-400 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {processing ? "Processing..." : "Approve & Create Spot"}
              </button>
              <button
                onClick={() => handleReject(selectedNomination)}
                disabled={processing}
                className="flex-1 px-4 py-2 bg-red-500/15 hover:bg-red-500/25 text-red-400 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                Reject
              </button>
              <button
                onClick={() => { setSelectedNomination(null); setAdminNotes(""); }}
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
