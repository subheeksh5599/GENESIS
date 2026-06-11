import { NextResponse } from "next/server";
import { loadAgents, getTotalTVL } from "@/lib/store";

export async function GET() {
  const agents = loadAgents();
  const tvl = getTotalTVL();

  return NextResponse.json({
    agents: agents.map((a) => ({
      id: a.id,
      name: a.name,
      strategy: a.strategy.slice(0, 100),
      protocols: a.protocols,
      contractAddress: a.contractAddress,
      txHash: a.txHash,
      createdAt: a.createdAt,
      status: a.status,
      pnl: a.pnl,
      tvl: a.tvl,
    })),
    stats: {
      total: agents.length,
      live: agents.filter((a) => a.status === "live").length,
      tvl,
    },
  });
}
