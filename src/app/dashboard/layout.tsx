"use client";

import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardHeader from "@/components/DashboardHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen bg-cream flex overflow-hidden text-text-primary">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-lavender/10 via-transparent to-transparent">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
