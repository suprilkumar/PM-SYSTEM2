// src/app/(app)/layout.jsx
import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import TopNav from "@/components/layout/TopNav";
import { getCurrentUser } from "@/core/auth/session";

export default async function AppLayout({ children }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopNav />
        {/* pt-14 offsets the fixed nav; on mobile no bottom padding needed now */}
        <main className="flex-1 pt-14">{children}</main>
      </div>
    </div>
  );
}