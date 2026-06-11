import { NextResponse } from "next/server";
import { reviewContract } from "@/lib/security-review";

export async function POST(request: Request) {
  const body = await request.json();
  const { source } = body as { source?: string };

  if (!source) {
    return NextResponse.json({ error: "Source code required" }, { status: 400 });
  }

  const report = await reviewContract(source);
  return NextResponse.json(report);
}
