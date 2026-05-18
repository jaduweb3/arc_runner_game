import { NextResponse } from "next/server";
import { fetchLeaderboard } from "@/lib/server/leaderboard";

export const runtime = "nodejs";
export const revalidate = 10;

export async function GET() {
  try {
    const entries = await fetchLeaderboard();
    return NextResponse.json(
      { entries },
      {
        headers: {
          "cache-control": "public, s-maxage=10, stale-while-revalidate=30",
        },
      },
    );
  } catch (err) {
    console.error("/api/leaderboard error:", err);
    return NextResponse.json({ error: "failed to load leaderboard" }, { status: 500 });
  }
}
