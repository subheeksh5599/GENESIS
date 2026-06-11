import { NextResponse } from "next/server";
import { loadAgents, getAgentById, getTotalTVL } from "@/lib/store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (id) {
    const agent = getAgentById(id);
    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }
    return NextResponse.json({ agent });
  }

  const agents = loadAgents();
  return NextResponse.json({
    agents: agents.map((a) => ({
      id: a.id,
      name: a.name,
      strategy: a.strategy.slice(0, 100),
      protocols: a.protocols,
      contractAddress: a.contractAddress,
      txHash: a.txHash,
      abi: a.abi,
      source: a.source,
      verified: a.verified,
      createdAt: a.createdAt,
      status: a.status,
      pnl: a.pnl,
      tvl: a.tvl,
    })),
    stats: {
      total: agents.length,
      live: agents.filter((a) => a.status === "live").length,
      tvl: getTotalTVL(),
    },
  });
}
