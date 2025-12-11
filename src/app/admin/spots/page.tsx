"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface Spot {
  id: string;
  name: string;
  city_id: string;
  types: string[];
  description: string;
  approved: boolean;
  created_at: string;
  updated_at: string;
}

export default function AdminSpotsPage() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "approved" | "pending">("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchSpots();
  }, []);

  async function fetchSpots() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("spots")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setSpots(data);
    }
    setLoading(false);
  }

  async function toggleApproval(spotId: string, currentStatus: boolean) {
    const supabase = createClient();
    const { error } = await supabase
      .from("spots")
      .update({ approved: !currentStatus })
      .eq("id", spotId);

    if (!error) {
      setSpots(spots.map(s => s.id === spotId ? { ...s, approved: !currentStatus } : s));
    }
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
          <p className="text-[var(--text-secondary)] mt-1">Manage all spots across cities</p>
        </div>
        <button className="px-4 py-2 bg-[var(--brand-lime)] hover:bg-[var(--brand-lime)]/90 text-[#0a0a0b] rounded-lg font-semibold transition-colors">
          Add Spot
        </button>
      </div>

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
                      <button className="px-3 py-1 text-xs font-medium bg-[var(--bg-dark)] text-[var(--text-secondary)] rounded hover:text-[var(--text-primary)] transition-colors">
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
