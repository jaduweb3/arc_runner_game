import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";
import { verifySession } from "@/lib/server/session";
import { signScoreEIP712 } from "@/lib/server/signScore";

export const runtime = "nodejs";

const SCORE_PER_SECOND = 10;
const PLAUSIBILITY_TOLERANCE = 1.2;
const MIN_GAME_DURATION_MS = 500;
const SIGNATURE_TTL_SECONDS = 5 * 60;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      token?: string;
      score?: number;
      player?: string;
    };

    if (!body.token || !body.player || !isAddress(body.player) || typeof body.score !== "number") {
      return NextResponse.json({ error: "missing or invalid fields" }, { status: 400 });
    }

    const session = verifySession(body.token);
    if (!session) {
      return NextResponse.json({ error: "invalid or tampered session token" }, { status: 401 });
    }

    if (session.player.toLowerCase() !== body.player.toLowerCase()) {
      return NextResponse.json({ error: "player mismatch" }, { status: 401 });
    }

    const elapsedMs = Date.now() - session.startedAt;
    if (elapsedMs < MIN_GAME_DURATION_MS) {
      return NextResponse.json({ error: "game ended too quickly" }, { status: 400 });
    }

    const score = Math.floor(body.score);
    if (!Number.isFinite(score) || score < 0) {
      return NextResponse.json({ error: "invalid score" }, { status: 400 });
    }

    const maxPlausible = Math.ceil((elapsedMs / 1000) * SCORE_PER_SECOND * PLAUSIBILITY_TOLERANCE);
    if (score > maxPlausible) {
      return NextResponse.json(
        { error: `score ${score} exceeds plausible max ${maxPlausible} for ${Math.round(elapsedMs / 1000)}s game` },
        { status: 400 },
      );
    }

    const nonce = BigInt("0x" + session.sessionId.replace(/[^a-f0-9]/gi, "").slice(0, 16) || "0");
    const deadline = BigInt(Math.floor(Date.now() / 1000) + SIGNATURE_TTL_SECONDS);

    const signature = await signScoreEIP712({
      player: body.player as `0x${string}`,
      score: BigInt(score),
      nonce,
      deadline,
    });

    return NextResponse.json({
      score: score.toString(),
      nonce: nonce.toString(),
      deadline: deadline.toString(),
      signature,
    });
  } catch (err) {
    console.error("/api/score/sign error:", err);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
