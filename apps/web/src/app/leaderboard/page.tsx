"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { WalletButton } from "@/components/WalletButton";

const EXPLORER = process.env.NEXT_PUBLIC_ARC_EXPLORER || "https://testnet.arcscan.app";
const REFRESH_MS = 10_000;

type Entry = { player: `0x${string}`; score: string; block: string };

function shortAddr(a: string) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

function avatarGradient(addr: string) {
  const h1 = parseInt(addr.slice(2, 8), 16) % 360;
  const h2 = parseInt(addr.slice(-6), 16) % 360;
  return `linear-gradient(135deg, hsl(${h1} 65% 55%), hsl(${h2} 65% 45%))`;
}

function formatScore(s: string) {
  return parseInt(s, 10).toLocaleString();
}

export default function LeaderboardPage() {
  const { address } = useAccount();
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number>(REFRESH_MS / 1000);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    let tick: ReturnType<typeof setInterval>;

    async function load() {
      try {
        const res = await fetch("/api/leaderboard");
        if (!res.ok) throw new Error(`status ${res.status}`);
        const data = (await res.json()) as { entries: Entry[] };
        if (!cancelled) {
          setEntries(data.entries);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "load failed");
      } finally {
        if (!cancelled) {
          setSecondsLeft(REFRESH_MS / 1000);
          timer = setTimeout(load, REFRESH_MS);
        }
      }
    }

    load();
    tick = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      clearInterval(tick);
    };
  }, []);

  const youAddrLower = address?.toLowerCase();
  const stats = useMemo(() => {
    if (!entries) return null;
    const top = entries[0] ? parseInt(entries[0].score, 10) : 0;
    const total = entries.reduce((acc, e) => acc + parseInt(e.score, 10), 0);
    const yourRank =
      youAddrLower !== undefined
        ? entries.findIndex((e) => e.player.toLowerCase() === youAddrLower) + 1
        : 0;
    const yourBest =
      youAddrLower !== undefined
        ? entries.find((e) => e.player.toLowerCase() === youAddrLower)?.score
        : undefined;
    return {
      players: entries.length,
      top,
      total,
      yourRank: yourRank > 0 ? yourRank : null,
      yourBest: yourBest ? parseInt(yourBest, 10) : null,
    };
  }, [entries, youAddrLower]);

  const podium = entries?.slice(0, 3) ?? [];
  const rest = entries?.slice(3) ?? [];

  return (
    <main className="flex-1 relative arcade-grid overflow-hidden flex flex-col">
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-xl font-black tracking-tight">
            <span className="text-emerald-400">ARC</span>
            <span className="text-neutral-100">.</span>
            <span className="text-neutral-400 group-hover:text-neutral-200 transition">arcade</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/play" className="text-sm text-emerald-400 hover:text-emerald-300 transition px-3 py-1.5">
            Play →
          </Link>
          <WalletButton />
        </div>
      </nav>

      <section className="relative z-10 flex-1 px-4 pb-16 max-w-5xl mx-auto w-full">
        <div className="flex flex-col items-center text-center gap-3 mt-2 mb-8">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-emerald-400/80 border border-emerald-500/20 bg-emerald-500/5 rounded-full px-4 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live · refresh in {secondsLeft}s
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight bg-gradient-to-r from-neutral-100 via-neutral-300 to-neutral-100 bg-clip-text text-transparent">
            Leaderboard
          </h1>
          <p className="text-neutral-500 text-sm">Top scores submitted on-chain to the Leaderboard contract</p>
        </div>

        <StatsRow stats={stats} />

        {entries === null && !error && <LoadingSkeleton />}
        {error && <ErrorCard message={error} />}
        {entries && entries.length === 0 && !error && <EmptyState />}

        {entries && entries.length > 0 && (
          <>
            {podium.length > 0 && (
              <Podium entries={podium} you={youAddrLower} />
            )}

            {rest.length > 0 && (
              <div className="mt-8 rounded-2xl border border-neutral-800 bg-neutral-950/60 backdrop-blur overflow-hidden">
                <div className="px-5 py-3 border-b border-neutral-800 text-xs uppercase tracking-wider text-neutral-500 grid grid-cols-12 gap-4">
                  <span className="col-span-1">#</span>
                  <span className="col-span-7">Player</span>
                  <span className="col-span-3 text-right">Best score</span>
                  <span className="col-span-1 text-right">Block</span>
                </div>
                {rest.map((e, i) => {
                  const rank = i + 4;
                  const isYou = youAddrLower === e.player.toLowerCase();
                  return (
                    <div
                      key={e.player}
                      className={`grid grid-cols-12 gap-4 px-5 py-3 border-t border-neutral-900 items-center text-sm transition ${
                        isYou ? "bg-emerald-500/5 hover:bg-emerald-500/10" : "hover:bg-neutral-900/50"
                      }`}
                    >
                      <span className="col-span-1 text-neutral-500 font-mono">{rank}</span>
                      <span className="col-span-7 flex items-center gap-3 min-w-0">
                        <span
                          className="w-7 h-7 rounded-full shrink-0 ring-1 ring-neutral-700"
                          style={{ background: avatarGradient(e.player) }}
                        />
                        <span className="truncate font-mono">{shortAddr(e.player)}</span>
                        {isYou && (
                          <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                            you
                          </span>
                        )}
                      </span>
                      <span className="col-span-3 text-right font-mono font-bold text-neutral-100">
                        {formatScore(e.score)}
                      </span>
                      <span className="col-span-1 text-right">
                        <a
                          href={`${EXPLORER}/address/${e.player}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-neutral-500 hover:text-neutral-300 transition"
                        >
                          ↗
                        </a>
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}

function StatsRow({ stats }: { stats: { players: number; top: number; yourRank: number | null; yourBest: number | null } | null }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
      <StatCard label="Players" value={stats ? stats.players.toString() : "—"} />
      <StatCard label="Top score" value={stats && stats.top > 0 ? stats.top.toLocaleString() : "—"} highlight />
      <StatCard label="Your rank" value={stats?.yourRank ? `#${stats.yourRank}` : "—"} />
      <StatCard label="Your best" value={stats?.yourBest ? stats.yourBest.toLocaleString() : "—"} />
    </div>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-xl border border-neutral-900 bg-neutral-950/40 px-4 py-3">
      <div className="text-[10px] uppercase tracking-wider text-neutral-500">{label}</div>
      <div className={`text-xl font-bold font-mono mt-0.5 ${highlight ? "text-emerald-400" : "text-neutral-100"}`}>
        {value}
      </div>
    </div>
  );
}

function Podium({ entries, you }: { entries: Entry[]; you: string | undefined }) {
  // Layout: 2nd | 1st | 3rd, with 1st tallest
  const slot = (rank: 1 | 2 | 3) => entries[rank - 1];
  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-5 items-end mt-2">
      <PodiumCard entry={slot(2)} rank={2} you={you} />
      <PodiumCard entry={slot(1)} rank={1} you={you} />
      <PodiumCard entry={slot(3)} rank={3} you={you} />
    </div>
  );
}

function PodiumCard({ entry, rank, you }: { entry: Entry | undefined; rank: 1 | 2 | 3; you: string | undefined }) {
  if (!entry) return <div />;
  const isYou = you === entry.player.toLowerCase();
  const styles = {
    1: { height: "h-44 sm:h-52", border: "border-amber-400/60", glow: "shadow-amber-500/20", badge: "bg-amber-400 text-amber-950", label: "1st" },
    2: { height: "h-36 sm:h-44", border: "border-neutral-400/60", glow: "shadow-neutral-400/10", badge: "bg-neutral-300 text-neutral-800", label: "2nd" },
    3: { height: "h-32 sm:h-40", border: "border-orange-400/60", glow: "shadow-orange-500/10", badge: "bg-orange-400 text-orange-950", label: "3rd" },
  }[rank];

  return (
    <div className={`relative rounded-2xl border ${styles.border} bg-neutral-950/70 backdrop-blur p-4 sm:p-5 ${styles.height} flex flex-col justify-between shadow-xl ${styles.glow}`}>
      <div className={`absolute -top-3 left-4 ${styles.badge} text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full`}>
        {styles.label}
      </div>
      <div className="flex items-center gap-3 mt-2">
        <div
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full ring-1 ring-neutral-700 shrink-0"
          style={{ background: avatarGradient(entry.player) }}
        />
        <div className="min-w-0">
          <div className="font-mono text-xs sm:text-sm truncate">{shortAddr(entry.player)}</div>
          {isYou && (
            <span className="inline-block text-[10px] font-bold uppercase tracking-wide text-emerald-400 mt-0.5">
              you
            </span>
          )}
        </div>
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-wider text-neutral-500">Best</div>
        <div className="text-2xl sm:text-3xl font-black font-mono text-neutral-100">
          {formatScore(entry.score)}
        </div>
        <a
          href={`${EXPLORER}/address/${entry.player}`}
          target="_blank"
          rel="noreferrer"
          className="text-[10px] text-neutral-500 hover:text-neutral-300 transition mt-1 inline-block"
        >
          view on Arcscan ↗
        </a>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3 mt-4">
      <div className="grid grid-cols-3 gap-4">
        {[2, 1, 3].map((i) => (
          <div key={i} className="h-44 rounded-2xl bg-neutral-900/50 animate-pulse" />
        ))}
      </div>
      <div className="rounded-2xl border border-neutral-900 overflow-hidden">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-14 border-t border-neutral-900 bg-neutral-950/30 animate-pulse first:border-t-0" />
        ))}
      </div>
    </div>
  );
}

function ErrorCard({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-6 text-center">
      <div className="text-red-400 font-medium">Couldn't load leaderboard</div>
      <div className="text-xs text-neutral-500 mt-1">{message}</div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-neutral-800 p-10 text-center mt-4">
      <div className="text-5xl mb-3">🏁</div>
      <div className="text-lg font-bold">No scores yet</div>
      <p className="text-sm text-neutral-500 mt-1 max-w-sm mx-auto">
        Be the first to put your score on the Arc Testnet leaderboard.
      </p>
      <Link
        href="/play"
        className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold transition"
      >
        Play now
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7L8 5z"/></svg>
      </Link>
    </div>
  );
}
