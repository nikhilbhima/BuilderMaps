import { notFound } from "next/navigation";
import { getAdminUser } from "@/lib/admin";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const metadata = {
  title: "Admin - Builder Maps",
  robots: "noindex, nofollow", // Hide from search engines
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check admin access - returns 404 for non-admins
  const adminUser = await getAdminUser();

  if (!adminUser) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[var(--bg-dark)] flex">
      <AdminSidebar adminUser={adminUser} />
      <main className="flex-1 lg:ml-64">
        {/* Add top padding on mobile for the fixed header */}
        <div className="p-4 pt-18 sm:p-6 lg:p-8 lg:pt-8">{children}</div>
      </main>
    </div>
  );
}
