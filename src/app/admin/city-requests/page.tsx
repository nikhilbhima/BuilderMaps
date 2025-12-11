"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface CityRequest {
  id: string;
  city_name: string;
  requested_by: string | null;
  status: "pending" | "approved" | "rejected";
  notes: string | null;
  created_at: string;
}

export default function AdminCityRequestsPage() {
  const [requests, setRequests] = useState<CityRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [selectedRequest, setSelectedRequest] = useState<CityRequest | null>(null);
  const [notes, setNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("city_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setRequests(data);
    }
    setLoading(false);
  }

  async function handleDecision(request: CityRequest, decision: "approved" | "rejected") {
    setProcessing(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("city_requests")
      .update({
        status: decision,
        notes: notes || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", request.id);

    if (!error) {
      setRequests(requests.map(r => r.id === request.id ? { ...r, status: decision } : r));
      setSelectedRequest(null);
      setNotes("");
    }
    setProcessing(false);
  }

  const filteredRequests = requests.filter(r =>
    filter === "all" || r.status === filter
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
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">City Requests</h1>
        <p className="text-[var(--text-secondary)] mt-1">Review requests for new cities</p>
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
            {f === "pending" && requests.filter(r => r.status === "pending").length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 bg-[var(--accent-lime)] text-[#0a0a0b] text-xs rounded-full">
                {requests.filter(r => r.status === "pending").length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-12 text-center text-[var(--text-secondary)]">
            No city requests found
          </div>
        ) : (
          filteredRequests.map((request) => (
            <div
              key={request.id}
              className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">{request.city_name}</h3>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                      request.status === "pending" ? "bg-yellow-500/15 text-yellow-400" :
                      request.status === "approved" ? "bg-green-500/15 text-green-400" :
                      "bg-red-500/15 text-red-400"
                    }`}>
                      {request.status}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">
                    Requested {new Date(request.created_at).toLocaleDateString()}
                  </p>
                </div>
                {request.status === "pending" && (
                  <button
                    onClick={() => setSelectedRequest(request)}
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
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl max-w-lg w-full p-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
              Review: {selectedRequest.city_name}
            </h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this decision..."
                rows={3}
                className="w-full px-4 py-2 bg-[var(--bg-dark)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-lime)]/50 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleDecision(selectedRequest, "approved")}
                disabled={processing}
                className="flex-1 px-4 py-2 bg-green-500/15 hover:bg-green-500/25 text-green-400 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                Approve
              </button>
              <button
                onClick={() => handleDecision(selectedRequest, "rejected")}
                disabled={processing}
                className="flex-1 px-4 py-2 bg-red-500/15 hover:bg-red-500/25 text-red-400 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                Reject
              </button>
              <button
                onClick={() => { setSelectedRequest(null); setNotes(""); }}
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
