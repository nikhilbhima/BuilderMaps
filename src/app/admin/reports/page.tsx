"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface SpotReport {
  id: string;
  spot_id: string;
  reported_by: string | null;
  report_type: string;
  details: string | null;
  status: "pending" | "reviewing" | "resolved" | "dismissed";
  resolution_notes: string | null;
  created_at: string;
  spot?: {
    name: string;
    city_id: string;
  };
}

interface AdminUser {
  role: "super_admin" | "city_admin";
  scope_values: string[];
}

const REPORT_TYPE_LABELS: Record<string, string> = {
  wrong_address: "Wrong Address",
  permanently_closed: "Permanently Closed",
  temporarily_closed: "Temporarily Closed",
  wrong_info: "Wrong Information",
  fake_spam: "Fake/Spam",
  duplicate: "Duplicate",
  other: "Other",
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState<SpotReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "reviewing" | "resolved" | "dismissed" | "all">("pending");
  const [selectedReport, setSelectedReport] = useState<SpotReport | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [processing, setProcessing] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
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

    // Fetch reports with spot info for city filtering
    const { data, error } = await supabase
      .from("spot_reports")
      .select(`
        *,
        spot:spots!spot_id(name, city_id)
      `)
      .order("created_at", { ascending: false });

    if (!error && data) {
      // Filter for city admins client-side (since we need to join with spots)
      let filteredData = data;
      if (adminData?.role === "city_admin" && adminData.scope_values.length > 0) {
        filteredData = data.filter(r => r.spot && adminData.scope_values.includes(r.spot.city_id));
      }
      setReports(filteredData);
    }
    setLoading(false);
  }

  async function updateReportStatus(report: SpotReport, newStatus: SpotReport["status"]) {
    setProcessing(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("spot_reports")
      .update({
        status: newStatus,
        resolution_notes: resolutionNotes || null,
        resolved_at: newStatus === "resolved" || newStatus === "dismissed" ? new Date().toISOString() : null,
      })
      .eq("id", report.id);

    if (!error) {
      setReports(reports.map(r => r.id === report.id ? { ...r, status: newStatus } : r));
      setSelectedReport(null);
      setResolutionNotes("");
    }
    setProcessing(false);
  }

  const filteredReports = reports.filter(r =>
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
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Spot Reports</h1>
        <p className="text-[var(--text-secondary)] mt-1">Handle user-reported issues with spots</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(["pending", "reviewing", "resolved", "dismissed", "all"] as const).map((f) => (
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
            {f === "pending" && reports.filter(r => r.status === "pending").length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 bg-[var(--accent-lime)] text-[#0a0a0b] text-xs rounded-full">
                {reports.filter(r => r.status === "pending").length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-12 text-center text-[var(--text-secondary)]">
            No reports found
          </div>
        ) : (
          filteredReports.map((report) => (
            <div
              key={report.id}
              className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      report.report_type === "fake_spam" || report.report_type === "permanently_closed"
                        ? "bg-red-500/15 text-red-400"
                        : "bg-yellow-500/15 text-yellow-400"
                    }`}>
                      {REPORT_TYPE_LABELS[report.report_type] || report.report_type}
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                      report.status === "pending" ? "bg-yellow-500/15 text-yellow-400" :
                      report.status === "reviewing" ? "bg-blue-500/15 text-blue-400" :
                      report.status === "resolved" ? "bg-green-500/15 text-green-400" :
                      "bg-gray-500/15 text-gray-400"
                    }`}>
                      {report.status}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-[var(--text-primary)] mb-1">
                    Spot ID: {report.spot_id}
                  </p>
                  {report.details && (
                    <p className="text-sm text-[var(--text-secondary)] mb-2">{report.details}</p>
                  )}
                  <p className="text-xs text-[var(--text-muted)]">
                    Reported {new Date(report.created_at).toLocaleDateString()}
                  </p>
                </div>
                {(report.status === "pending" || report.status === "reviewing") && (
                  <button
                    onClick={() => setSelectedReport(report)}
                    className="px-4 py-2 bg-[var(--brand-lime)] hover:bg-[var(--brand-lime)]/90 text-[#0a0a0b] rounded-lg text-sm font-semibold transition-colors"
                  >
                    Handle
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Handle Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl max-w-lg w-full p-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
              Handle Report
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              {REPORT_TYPE_LABELS[selectedReport.report_type]} - {selectedReport.spot_id}
            </p>
            {selectedReport.details && (
              <p className="text-sm text-[var(--text-secondary)] mb-4 p-3 bg-[var(--bg-dark)] rounded-lg">
                {selectedReport.details}
              </p>
            )}
            <div className="mb-4">
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Resolution Notes
              </label>
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Describe how you resolved this..."
                rows={3}
                className="w-full px-4 py-2 bg-[var(--bg-dark)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-lime)]/50 resize-none"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedReport.status === "pending" && (
                <button
                  onClick={() => updateReportStatus(selectedReport, "reviewing")}
                  disabled={processing}
                  className="flex-1 px-4 py-2 bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  Start Review
                </button>
              )}
              <button
                onClick={() => updateReportStatus(selectedReport, "resolved")}
                disabled={processing}
                className="flex-1 px-4 py-2 bg-green-500/15 hover:bg-green-500/25 text-green-400 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                Resolve
              </button>
              <button
                onClick={() => updateReportStatus(selectedReport, "dismissed")}
                disabled={processing}
                className="flex-1 px-4 py-2 bg-gray-500/15 hover:bg-gray-500/25 text-gray-400 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                Dismiss
              </button>
              <button
                onClick={() => { setSelectedReport(null); setResolutionNotes(""); }}
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
