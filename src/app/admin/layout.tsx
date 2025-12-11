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
      <main className="flex-1 ml-64">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
