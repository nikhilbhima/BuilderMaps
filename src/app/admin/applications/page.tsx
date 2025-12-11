"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface AdminApplication {
  id: string;
  user_id: string;
  requested_cities: string[];
  reason: string;
  social_proof: string | null;
  status: "pending" | "approved" | "rejected";
  review_notes: string | null;
  created_at: string;
  user?: {
    handle: string;
    display_name: string | null;
  };
}

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<AdminApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [selectedApplication, setSelectedApplication] = useState<AdminApplication | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  async function fetchApplications() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("admin_applications")
      .select(`
        *,
        user:users(handle, display_name)
      `)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setApplications(data);
    }
    setLoading(false);
  }

  async function handleDecision(application: AdminApplication, decision: "approved" | "rejected") {
    setProcessing(true);
    const supabase = createClient();

    // Update application status
    const { error: updateError } = await supabase
      .from("admin_applications")
      .update({
        status: decision,
        review_notes: reviewNotes || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", application.id);

    if (updateError) {
      setProcessing(false);
      return;
    }

    // If approved, create admin user
    if (decision === "approved") {
      const { error: adminError } = await supabase
        .from("admin_users")
        .insert({
          user_id: application.user_id,
          role: "city_admin",
          scope_type: "city",
          scope_values: application.requested_cities,
          status: "active",
        });

      if (adminError) {
        console.error("Failed to create admin user:", adminError);
      }
    }

    setApplications(applications.map(a => a.id === application.id ? { ...a, status: decision } : a));
    setSelectedApplication(null);
    setReviewNotes("");
    setProcessing(false);
  }

  const filteredApplications = applications.filter(a =>
    filter === "all" || a.status === filter
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
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Admin Applications</h1>
        <p className="text-[var(--text-secondary)] mt-1">Review applications from users who want to become city admins</p>
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
            {f === "pending" && applications.filter(a => a.status === "pending").length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 bg-[var(--accent-lime)] text-[#0a0a0b] text-xs rounded-full">
                {applications.filter(a => a.status === "pending").length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.length === 0 ? (
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-12 text-center text-[var(--text-secondary)]">
            No applications found
          </div>
        ) : (
          filteredApplications.map((application) => (
            <div
              key={application.id}
              className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                      @{application.user?.handle || "Unknown"}
                    </h3>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                      application.status === "pending" ? "bg-yellow-500/15 text-yellow-400" :
                      application.status === "approved" ? "bg-green-500/15 text-green-400" :
                      "bg-red-500/15 text-red-400"
                    }`}>
                      {application.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {application.requested_cities.map((city) => (
                      <span key={city} className="px-2 py-1 bg-[var(--bg-dark)] text-[var(--text-secondary)] text-xs rounded">
                        {city}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] mb-2">{application.reason}</p>
                  {application.social_proof && (
                    <p className="text-xs text-[var(--text-muted)] mb-2">
                      <span className="font-medium">Social proof:</span> {application.social_proof}
                    </p>
                  )}
                  <p className="text-xs text-[var(--text-muted)]">
                    Applied {new Date(application.created_at).toLocaleDateString()}
                  </p>
                </div>
                {application.status === "pending" && (
                  <button
                    onClick={() => setSelectedApplication(application)}
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
      {selectedApplication && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
              Review Application
            </h2>
            <p className="text-sm text-[var(--accent-lime)] mb-4">
              @{selectedApplication.user?.handle}
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1">Requested Cities</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedApplication.requested_cities.map((city) => (
                    <span key={city} className="px-2 py-1 bg-[var(--bg-dark)] text-[var(--text-secondary)] text-sm rounded">
                      {city}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1">Reason</h4>
                <p className="text-sm text-[var(--text-secondary)] p-3 bg-[var(--bg-dark)] rounded-lg">
                  {selectedApplication.reason}
                </p>
              </div>

              {selectedApplication.social_proof && (
                <div>
                  <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1">Social Proof</h4>
                  <p className="text-sm text-[var(--text-secondary)] p-3 bg-[var(--bg-dark)] rounded-lg">
                    {selectedApplication.social_proof}
                  </p>
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Review Notes (optional)
              </label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Add notes about this decision..."
                rows={3}
                className="w-full px-4 py-2 bg-[var(--bg-dark)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-lime)]/50 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleDecision(selectedApplication, "approved")}
                disabled={processing}
                className="flex-1 px-4 py-2 bg-green-500/15 hover:bg-green-500/25 text-green-400 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {processing ? "Processing..." : "Approve"}
              </button>
              <button
                onClick={() => handleDecision(selectedApplication, "rejected")}
                disabled={processing}
                className="flex-1 px-4 py-2 bg-red-500/15 hover:bg-red-500/25 text-red-400 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                Reject
              </button>
              <button
                onClick={() => { setSelectedApplication(null); setReviewNotes(""); }}
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
