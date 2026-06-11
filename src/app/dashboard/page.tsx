"use client";

import { useState } from "react";
import { StatsBar } from "@/app/components/dashboard/stats-bar";
import { AgentGrid } from "@/app/components/dashboard/agent-grid";
import { ActivityFeed } from "@/app/components/dashboard/activity-feed";
import { DeployModal } from "@/app/components/dashboard/deploy-modal";

export default function DashboardPage() {
  const [deployOpen, setDeployOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDeployed = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-surface-alt/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-9 h-[72px]">
          <div>
            <h1 className="font-display font-semibold text-2xl tracking-[-0.015em]">
              Overview
            </h1>
            <p className="font-mono text-[0.5rem] tracking-[0.2em] uppercase text-ink-soft mt-0.5">
              Mantle Network
            </p>
          </div>
          <button
            onClick={() => setDeployOpen(true)}
            className="font-display italic text-sm text-white bg-ink px-6 py-2.5 tracking-[0.03em] hover:bg-accent transition-colors"
          >
            + Synthesize Protocol
          </button>
        </div>
      </header>

      <div className="p-9 space-y-10">
        <StatsBar />
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          <div className="xl:col-span-3 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-semibold text-lg">Active Protocols</h2>
            </div>
            <div key={refreshKey}>
              <AgentGrid />
            </div>
          </div>
          <div className="xl:col-span-1 space-y-5">
            <ActivityFeed />
          </div>
        </div>
      </div>

      <DeployModal
        open={deployOpen}
        onClose={() => setDeployOpen(false)}
        onDeployed={handleDeployed}
      />
    </>
  );
}
