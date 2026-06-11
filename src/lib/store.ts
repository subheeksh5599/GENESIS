import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "agents.json");

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

function ensureDataDir() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export function loadAgents(): StoredAgent[] {
  ensureDataDir();
  if (!fs.existsSync(DATA_FILE)) return [];
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(raw);
}

export function saveAgent(agent: StoredAgent) {
  ensureDataDir();
  const agents = loadAgents();
  agents.unshift(agent);
  fs.writeFileSync(DATA_FILE, JSON.stringify(agents, null, 2));
}

export function getAgentById(id: string): StoredAgent | null {
  return loadAgents().find((a) => a.id === id) || null;
}

export function getAgentCount(): number {
  return loadAgents().length;
}

export function getTotalTVL(): string {
  const agents = loadAgents();
  const total = agents
    .filter((a) => a.status === "live")
    .reduce((sum, a) => sum + parseFloat(a.tvl.replace(/[^0-9.]/g, "")) || 0, 0);
  if (total >= 1e6) return `$${(total / 1e6).toFixed(1)}M`;
  if (total >= 1e3) return `$${(total / 1e3).toFixed(0)}K`;
  return `$${total.toFixed(0)}`;
}

export function updateAgent(id: string, updates: Partial<StoredAgent>) {
  const agents = loadAgents();
  const idx = agents.findIndex((a) => a.id === id);
  if (idx === -1) return;
  agents[idx] = { ...agents[idx], ...updates };
  fs.writeFileSync(DATA_FILE, JSON.stringify(agents, null, 2));
}
