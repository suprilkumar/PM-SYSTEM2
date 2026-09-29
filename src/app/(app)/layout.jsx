// src/app/(app)/layout.js
import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { getCurrentUser } from "@/core/auth/session";
import FloatingNav from "@/components/layout/FloatingNav";

export default async function AppLayout({ children }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        {/* Add bottom padding so content clears the floating capsule */}
        <main className="flex-1 pb-24 md:pb-0">{children}</main>
        <FloatingNav />
      </div>
    </div>
  );
}