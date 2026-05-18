"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAccount } from "wagmi";
import Link from "next/link";
import { GameContainer } from "@/components/GameContainer";
import { WalletButton } from "@/components/WalletButton";
import { useSubmitScore } from "@/lib/web3/useSubmitScore";
import { useSettings } from "@/lib/store/settings";
import { THEMES } from "@/lib/game/themes";
import { SKINS } from "@/lib/game/skins";

const EXPLORER = process.env.NEXT_PUBLIC_ARC_EXPLORER || "https://testnet.arcscan.app";

export default function PlayPage() {
  const { address, isConnected } = useAccount();
  const themeId = useSettings((s) => s.theme);
  const skinId = useSettings((s) => s.skin);
  const theme = THEMES[themeId];
  const skin = SKINS[skinId];

  const [lastScore, setLastScore] = useState<number | null>(null);
  const [bestScore, setBestScore] = useState<number>(0);
  const [playing, setPlaying] = useState(false);
  const tokenRef = useRef<string | null>(null);
  const { state, submit, reset } = useSubmitScore();

  useEffect(() => {
    if (typeof window === "undefined" || !address) return;
    const stored = window.localStorage.getItem(`arc-best-${address.toLowerCase()}`);
    if (stored) setBestScore(parseInt(stored, 10) || 0);
  }, [address]);

  const handleGameStart = useCallback(async () => {
    setPlaying(true);
    setLastScore(null);
    reset();
    if (!address) return;
    tokenRef.current = null;
    try {
      const res = await fetch("/api/score/start", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ player: address }),
      });
      const data = (await res.json()) as { token?: string };
      if (data.token) tokenRef.current = data.token;
    } catch (err) {
      console.error("session start failed:", err);
    }
  }, [address, reset]);

  const handleGameOver = useCallback(
    (score: number) => {
      setPlaying(false);
      setLastScore(score);
      if (address && score > bestScore) {
        setBestScore(score);
        window.localStorage.setItem(`arc-best-${address.toLowerCase()}`, String(score));
      }
    },
    [address, bestScore],
  );

  const handleSubmit = useCallback(() => {
    if (!tokenRef.current || lastScore === null) return;
    submit(tokenRef.current, lastScore);
  }, [submit, lastScore]);

  const isNewBest = lastScore !== null && lastScore >= bestScore && lastScore > 0;

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
          <Link href="/leaderboard" className="text-sm text-neutral-400 hover:text-white transition px-3 py-1.5">
            Leaderboard
          </Link>
          <WalletButton />
        </div>
      </nav>

      {!isConnected ? (
        <ConnectGate />
      ) : (
        <section className="relative z-10 flex-1 flex flex-col items-center px-4 pb-12 max-w-5xl mx-auto w-full">
          <StatBar
            lastScore={lastScore}
            bestScore={bestScore}
            playing={playing}
            themeLabel={theme.label}
            skinLabel={skin.label}
          />

          <div className="relative w-full max-w-[820px] mt-4">
            <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-transparent to-emerald-500/10 blur-2xl pointer-events-none" />
            <div className="relative rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl bg-black">
              <GameContainer onGameStart={handleGameStart} onGameOver={handleGameOver} />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4 text-xs text-neutral-500">
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 font-mono text-neutral-300">Space</kbd>
              <span>jump</span>
            </div>
            <span className="opacity-40">·</span>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 font-mono text-neutral-300">Tap</kbd>
              <span>mobile</span>
            </div>
            <span className="opacity-40">·</span>
            <Link href="/" className="hover:text-neutral-300 transition">Change theme / skin ↗</Link>
          </div>

          {lastScore !== null && !playing && (
            <GameOverPanel
              score={lastScore}
              isNewBest={isNewBest}
              submitState={state}
              onSubmit={handleSubmit}
            />
          )}
        </section>
      )}
    </main>
  );
}

function ConnectGate() {
  return (
    <section className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-20 text-center gap-6">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/30 flex items-center justify-center">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgb(52, 211, 153)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="6" width="20" height="12" rx="2" />
          <path d="M22 10h-4a2 2 0 0 0 0 4h4" />
        </svg>
      </div>
      <div>
        <h2 className="text-2xl font-bold">Connect your wallet to play</h2>
        <p className="text-neutral-400 mt-2 max-w-md">
          Your wallet is your identity on the leaderboard. We never spend or hold your funds.
        </p>
      </div>
      <WalletButton />
    </section>
  );
}

function StatBar({
  lastScore,
  bestScore,
  playing,
  themeLabel,
  skinLabel,
}: {
  lastScore: number | null;
  bestScore: number;
  playing: boolean;
  themeLabel: string;
  skinLabel: string;
}) {
  return (
    <div className="w-full max-w-[820px] flex items-center justify-between gap-4 mt-2">
      <div className="flex items-center gap-2 sm:gap-4">
        <Stat label="Last" value={lastScore !== null ? String(lastScore) : "—"} />
        <Divider />
        <Stat label="Best" value={bestScore > 0 ? String(bestScore) : "—"} highlight />
      </div>
      <div className="flex items-center gap-2">
        <Pill>{themeLabel}</Pill>
        <Pill>{skinLabel}</Pill>
        {playing && (
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-emerald-400 ml-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live
          </span>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] uppercase tracking-wider text-neutral-500">{label}</span>
      <span className={`text-lg sm:text-xl font-bold font-mono ${highlight ? "text-emerald-400" : "text-neutral-100"}`}>
        {value}
      </span>
    </div>
  );
}

function Divider() {
  return <span className="w-px h-8 bg-neutral-800" />;
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] uppercase tracking-wide text-neutral-300 bg-neutral-900 border border-neutral-800 rounded-full px-2.5 py-1">
      {children}
    </span>
  );
}

type SubmitState =
  | { status: "idle" }
  | { status: "signing" }
  | { status: "sending" }
  | { status: "mining"; hash: `0x${string}` }
  | { status: "success"; hash: `0x${string}` }
  | { status: "error"; message: string };

function GameOverPanel({
  score,
  isNewBest,
  submitState,
  onSubmit,
}: {
  score: number;
  isNewBest: boolean;
  submitState: SubmitState;
  onSubmit: () => void;
}) {
  return (
    <div className="w-full max-w-[820px] mt-6 rounded-2xl border border-neutral-800 bg-neutral-950/80 backdrop-blur p-6 sm:p-8 shadow-xl animate-[fadeIn_0.3s_ease-out]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-neutral-500 mb-1">Run complete</div>
          <div className="flex items-baseline gap-3">
            <span className="text-5xl sm:text-6xl font-black font-mono text-neutral-100">{score}</span>
            {isNewBest && score > 0 && (
              <span className="text-xs font-bold uppercase tracking-wide text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                New best
              </span>
            )}
          </div>
          <div className="text-sm text-neutral-500 mt-1">Hit Space or tap the game to play again</div>
        </div>

        <div className="w-full sm:w-auto flex flex-col items-stretch sm:items-end gap-2">
          {submitState.status === "idle" && (
            <button
              onClick={onSubmit}
              disabled={score === 0}
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed text-black font-bold transition shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 inline-flex items-center justify-center gap-2"
            >
              <span>Submit on-chain</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
              </svg>
            </button>
          )}

          {submitState.status === "signing" && <Status text="Getting server signature…" />}
          {submitState.status === "sending" && <Status text="Confirm in your wallet…" tone="amber" />}
          {submitState.status === "mining" && (
            <Status
              text="Mining transaction…"
              tone="amber"
              link={{ href: `${EXPLORER}/tx/${submitState.hash}`, label: "view tx" }}
            />
          )}
          {submitState.status === "success" && (
            <Status
              text="✓ Submitted on-chain"
              tone="emerald"
              link={{ href: `${EXPLORER}/tx/${submitState.hash}`, label: "view on Arcscan" }}
            />
          )}
          {submitState.status === "error" && <Status text={submitState.message} tone="red" />}
        </div>
      </div>
    </div>
  );
}

function Status({
  text,
  tone = "neutral",
  link,
}: {
  text: string;
  tone?: "neutral" | "amber" | "emerald" | "red";
  link?: { href: string; label: string };
}) {
  const toneClasses = {
    neutral: "text-neutral-300 border-neutral-800 bg-neutral-900",
    amber: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    emerald: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    red: "text-red-400 border-red-500/30 bg-red-500/10",
  }[tone];
  return (
    <div className={`text-sm rounded-xl border px-4 py-3 ${toneClasses} flex items-center gap-3 min-w-[240px] justify-center`}>
      {tone === "amber" || tone === "neutral" ? (
        <span className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
      ) : null}
      <span className="font-medium">{text}</span>
      {link && (
        <a className="underline text-xs opacity-80 hover:opacity-100" href={link.href} target="_blank" rel="noreferrer">
          {link.label}
        </a>
      )}
    </div>
  );
}
