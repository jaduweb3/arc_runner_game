import "server-only";
import crypto from "node:crypto";

type SessionPayload = {
  player: `0x${string}`;
  startedAt: number;
  sessionId: string;
};

function getSecret(): string {
  const s = process.env.SERVER_HMAC_SECRET;
  if (!s) throw new Error("SERVER_HMAC_SECRET is not set");
  return s;
}

function b64url(buf: Buffer): string {
  return buf.toString("base64").replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function fromB64url(s: string): Buffer {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  return Buffer.from(s, "base64");
}

function sign(body: string): string {
  return b64url(crypto.createHmac("sha256", getSecret()).update(body).digest());
}

export function issueSession(player: `0x${string}`): { token: string; sessionId: string; startedAt: number } {
  const payload: SessionPayload = {
    player: player.toLowerCase() as `0x${string}`,
    startedAt: Date.now(),
    sessionId: b64url(crypto.randomBytes(16)),
  };
  const body = b64url(Buffer.from(JSON.stringify(payload)));
  const sig = sign(body);
  return { token: `${body}.${sig}`, sessionId: payload.sessionId, startedAt: payload.startedAt };
}

export function verifySession(token: string): SessionPayload | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  const expected = sign(body);
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const payload = JSON.parse(fromB64url(body).toString("utf8")) as SessionPayload;
    if (!payload.player || !payload.startedAt || !payload.sessionId) return null;
    return payload;
  } catch {
    return null;
  }
}
