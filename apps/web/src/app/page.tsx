import Link from "next/link";
import { WalletButton } from "@/components/WalletButton";
import { ThemePicker } from "@/components/ThemePicker";
import { SkinPicker } from "@/components/SkinPicker";

export default function HomePage() {
  return (
    <main className="flex-1 relative arcade-grid overflow-hidden">
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-xl font-black tracking-tight">
            <span className="text-emerald-400">ARC</span>
            <span className="text-neutral-100">.</span>
            <span className="text-neutral-400 group-hover:text-neutral-200 transition">arcade</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/leaderboard"
            className="text-sm text-neutral-400 hover:text-white transition px-3 py-1.5"
          >
            Leaderboard
          </Link>
          <WalletButton />
        </div>
      </nav>

      <section className="relative z-10 px-6 pt-8 pb-12 max-w-6xl mx-auto">
        <div className="flex flex-col items-center text-center gap-6 mb-12">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-emerald-400/80 border border-emerald-500/20 bg-emerald-500/5 rounded-full px-4 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live on Arc Testnet
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight">
            <span className="bg-gradient-to-r from-emerald-300 via-emerald-400 to-emerald-200 bg-clip-text text-transparent">
              ARC Mini Arcade
            </span>
          </h1>

          <p className="text-neutral-400 max-w-xl text-base sm:text-lg leading-relaxed">
            A Web3 endless runner. Jump over hazards, rack up score,{" "}
            <span className="text-neutral-200">submit it on-chain</span>, and climb the leaderboard.
          </p>

          <div className="flex items-center gap-3 mt-2">
            <Link
              href="/play"
              className="group relative inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-500 text-black font-bold text-base hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50"
            >
              <span>Play</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="transition-transform group-hover:translate-x-0.5">
                <path d="M8 5v14l11-7L8 5z" />
              </svg>
            </Link>
            <Link
              href="/leaderboard"
              className="px-6 py-3.5 rounded-xl border border-neutral-800 hover:border-neutral-600 hover:bg-neutral-900/50 transition text-neutral-200 font-medium"
            >
              Leaderboard
            </Link>
          </div>

          <div className="flex items-center gap-6 text-xs text-neutral-500 mt-3">
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 font-mono text-neutral-300">Space</kbd>
              <span>jump</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 font-mono text-neutral-300">Tap</kbd>
              <span>on mobile</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 mt-6">
          <div className="lg:col-span-3">
            <ThemePicker />
          </div>
          <div className="lg:col-span-2">
            <SkinPicker />
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <FeatureCard
            step="01"
            title="Connect"
            desc="Connect a wallet on Arc Testnet — your identity for the leaderboard."
          />
          <FeatureCard
            step="02"
            title="Play"
            desc="Endless runner. Survive longer, score higher. No transactions while playing."
          />
          <FeatureCard
            step="03"
            title="Submit on-chain"
            desc="Server signs your score. One transaction puts it on the public leaderboard."
          />
        </div>
      </section>

      <footer className="relative z-10 border-t border-neutral-900 mt-12 py-6 text-center text-xs text-neutral-600">
        Built on Arc Testnet · anti-cheat signed scores · open-source
      </footer>
    </main>
  );
}

function FeatureCard({ step, title, desc }: { step: string; title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-neutral-900 bg-neutral-950/40 p-4 hover:border-neutral-800 transition">
      <div className="text-[10px] font-mono text-emerald-500/80 mb-1">{step}</div>
      <div className="font-semibold text-neutral-100">{title}</div>
      <div className="text-neutral-500 mt-1 text-[13px] leading-relaxed">{desc}</div>
    </div>
  );
}
