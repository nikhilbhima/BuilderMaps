import { getAdminPendingCounts, getAdminUser } from "@/lib/admin";
import Link from "next/link";

export default async function AdminDashboard() {
  const [adminUser, counts] = await Promise.all([
    getAdminUser(),
    getAdminPendingCounts(),
  ]);

  const isSuperAdmin = adminUser?.role === "super_admin";

  const stats = [
    {
      label: "Pending Nominations",
      count: counts.nominations,
      href: "/admin/nominations",
      color: "lime",
      available: true,
    },
    {
      label: "City Requests",
      count: counts.cityRequests,
      href: "/admin/city-requests",
      color: "blue",
      available: isSuperAdmin,
    },
    {
      label: "Spot Reports",
      count: counts.spotReports,
      href: "/admin/reports",
      color: "orange",
      available: true,
    },
    {
      label: "Admin Applications",
      count: counts.adminApplications,
      href: "/admin/applications",
      color: "purple",
      available: isSuperAdmin,
    },
    {
      label: "Deletion Requests",
      count: counts.deletionRequests,
      href: "/admin/deletions",
      color: "red",
      available: isSuperAdmin,
    },
  ];

  const colorStyles: Record<string, string> = {
    lime: "bg-[var(--accent-lime)]/10 text-[var(--accent-lime)] border-[var(--accent-lime)]/30",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    orange: "bg-orange-500/10 text-orange-400 border-orange-500/30",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    red: "bg-red-500/10 text-red-400 border-red-500/30",
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          Admin Dashboard
        </h1>
        <p className="text-[var(--text-secondary)] mt-1">
          Welcome back! Here&apos;s what needs your attention.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats
          .filter((stat) => stat.available)
          .map((stat) => (
            <Link
              key={stat.label}
              href={stat.href}
              className={`p-6 rounded-xl border transition-all hover:scale-[1.02] ${colorStyles[stat.color]}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium opacity-80">{stat.label}</span>
                {stat.count > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-current/20">
                    {stat.count}
                  </span>
                )}
              </div>
              <div className="text-3xl font-bold mt-2">{stat.count}</div>
            </Link>
          ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/spots"
            className="px-4 py-2 bg-[var(--bg-card-hover)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] text-sm hover:border-[var(--accent-lime)]/50 transition-colors"
          >
            Manage Spots
          </Link>
          <Link
            href="/admin/nominations"
            className="px-4 py-2 bg-[var(--bg-card-hover)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] text-sm hover:border-[var(--accent-lime)]/50 transition-colors"
          >
            Review Nominations
          </Link>
          {isSuperAdmin && (
            <>
              <Link
                href="/admin/team"
                className="px-4 py-2 bg-[var(--bg-card-hover)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] text-sm hover:border-[var(--accent-lime)]/50 transition-colors"
              >
                Manage Team
              </Link>
              <Link
                href="/admin/audit"
                className="px-4 py-2 bg-[var(--bg-card-hover)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] text-sm hover:border-[var(--accent-lime)]/50 transition-colors"
              >
                View Audit Log
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Role Info */}
      <div className="mt-6 p-4 bg-[var(--bg-card-hover)] border border-[var(--border)] rounded-lg">
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
            isSuperAdmin
              ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
              : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
          }`}>
            {isSuperAdmin ? "Super Admin" : "City Admin"}
          </div>
          <span className="text-sm text-[var(--text-secondary)]">
            {isSuperAdmin
              ? "Full access to all features"
              : `Managing: ${adminUser?.scope_values.join(", ") || "No cities assigned"}`}
          </span>
        </div>
      </div>
    </div>
  );
}
