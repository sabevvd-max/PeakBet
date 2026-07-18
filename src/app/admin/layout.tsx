import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";
import { AdminNav } from "@/components/admin/AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  if (!admin) redirect("/");

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row lg:px-8">
      <AdminNav />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
