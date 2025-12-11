"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface AuditLog {
  id: string;
  admin_id: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  created_at: string;
  admin?: {
    handle: string;
  };
}

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("admin_audit_log")
      .select(`
        *,
        admin:users!admin_id(handle)
      `)
      .order("created_at", { ascending: false })
      .limit(100);

    if (!error && data) {
      setLogs(data);
    }
    setLoading(false);
  }

  const getActionColor = (action: string) => {
    if (action.includes("delete") || action.includes("remove")) return "text-red-400";
    if (action.includes("create") || action.includes("add") || action.includes("approve")) return "text-green-400";
    if (action.includes("update") || action.includes("edit")) return "text-blue-400";
    if (action.includes("reject")) return "text-yellow-400";
    return "text-[var(--text-secondary)]";
  };

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
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Audit Log</h1>
        <p className="text-[var(--text-secondary)] mt-1">View all admin actions</p>
      </div>

      {/* Logs List */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-12 text-center text-[var(--text-secondary)]">
            No audit logs found
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-4 hover:bg-[var(--bg-card-hover)] cursor-pointer transition-colors"
                onClick={() => setSelectedLog(log)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-[var(--text-primary)]">
                        @{log.admin?.handle || "Unknown"}
                      </span>
                      <span className={`text-sm font-medium ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </div>
                    {log.target_type && (
                      <p className="text-xs text-[var(--text-muted)]">
                        {log.target_type}: {log.target_id}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-[var(--text-muted)]">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
              Audit Log Details
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-[var(--text-muted)] uppercase mb-1">Admin</p>
                  <p className="text-sm text-[var(--text-primary)]">@{selectedLog.admin?.handle || "Unknown"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-[var(--text-muted)] uppercase mb-1">Action</p>
                  <p className={`text-sm font-medium ${getActionColor(selectedLog.action)}`}>
                    {selectedLog.action}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-[var(--text-muted)] uppercase mb-1">Target Type</p>
                  <p className="text-sm text-[var(--text-primary)]">{selectedLog.target_type || "-"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-[var(--text-muted)] uppercase mb-1">Target ID</p>
                  <p className="text-sm text-[var(--text-primary)] break-all">{selectedLog.target_id || "-"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-medium text-[var(--text-muted)] uppercase mb-1">Timestamp</p>
                  <p className="text-sm text-[var(--text-primary)]">
                    {new Date(selectedLog.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              {selectedLog.old_value && (
                <div>
                  <p className="text-xs font-medium text-[var(--text-muted)] uppercase mb-2">Old Value</p>
                  <pre className="p-3 bg-[var(--bg-dark)] rounded-lg text-xs text-[var(--text-secondary)] overflow-x-auto">
                    {JSON.stringify(selectedLog.old_value, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.new_value && (
                <div>
                  <p className="text-xs font-medium text-[var(--text-muted)] uppercase mb-2">New Value</p>
                  <pre className="p-3 bg-[var(--bg-dark)] rounded-lg text-xs text-[var(--text-secondary)] overflow-x-auto">
                    {JSON.stringify(selectedLog.new_value, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="mt-6">
              <button
                onClick={() => setSelectedLog(null)}
                className="w-full px-4 py-2 bg-[var(--bg-dark)] text-[var(--text-secondary)] rounded-lg font-semibold transition-colors hover:text-[var(--text-primary)]"
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
