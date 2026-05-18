import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";
import { issueSession } from "@/lib/server/session";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { player } = (await req.json()) as { player?: string };
    if (!player || !isAddress(player)) {
      return NextResponse.json({ error: "invalid player address" }, { status: 400 });
    }
    const { token, sessionId, startedAt } = issueSession(player as `0x${string}`);
    return NextResponse.json({ token, sessionId, startedAt });
  } catch (err) {
    console.error("/api/score/start error:", err);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
