export interface StoredAgent {
  id: string;
  name: string;
  strategy: string;
  protocols: string[];
  contractAddress: string;
  deployerAddress: string;
  txHash: string;
  abi?: Record<string, unknown>[];
  source?: string;
  verified?: boolean;
  createdAt: string;
  deployedAt: number;
  status: "live" | "paused" | "failed";
  pnl: string;
  tvl: string;
}

// In-memory store — survives cold starts on serverless (Vercel)
// Agents persist for the lifetime of the serverless instance
const agents: StoredAgent[] = [];

export function loadAgents(): StoredAgent[] {
  return agents;
}

export function saveAgent(agent: StoredAgent) {
  agents.unshift(agent);
}

export function getAgentById(id: string): StoredAgent | null {
  return agents.find((a) => a.id === id) || null;
}

export function getAgentCount(): number {
  return agents.length;
}

export function getTotalTVL(): string {
  const total = agents
    .filter((a) => a.status === "live")
    .reduce((sum, a) => sum + parseFloat(a.tvl.replace(/[^0-9.]/g, "")) || 0, 0);
  if (total >= 1e6) return `$${(total / 1e6).toFixed(1)}M`;
  if (total >= 1e3) return `$${(total / 1e3).toFixed(0)}K`;
  return `$${total.toFixed(0)}`;
}

export function updateAgent(id: string, updates: Partial<StoredAgent>) {
  const idx = agents.findIndex((a) => a.id === id);
  if (idx === -1) return;
  agents[idx] = { ...agents[idx], ...updates };
}
