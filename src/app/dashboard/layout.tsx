"use client";

import { Sidebar } from "@/app/components/dashboard/sidebar";
import { WalletPanel } from "@/app/components/dashboard/wallet-panel";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-surface-alt">
      <Sidebar />
      <main className="flex-1 ml-[240px]">
        {children}
      </main>
      <aside className="w-[340px] shrink-0 border-l border-border bg-white sticky top-0 h-screen overflow-y-auto hidden xl:block">
        <div className="p-6 pt-[88px]">
          <WalletPanel />
        </div>
      </aside>
    </div>
  );
}
