"use client";

import { Sidebar } from "@/app/components/dashboard/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-surface-alt">
      <Sidebar />
      <main className="flex-1 lg:ml-[240px] ml-0 pt-16 lg:pt-0">
        {children}
      </main>
    </div>
  );
}
