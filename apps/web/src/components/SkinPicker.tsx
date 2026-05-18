"use client";

import { useSettings } from "@/lib/store/settings";
import { SKIN_LIST } from "@/lib/game/skins";

export function SkinPicker() {
  const skin = useSettings((s) => s.skin);
  const setSkin = useSettings((s) => s.setSkin);

  return (
    <section className="w-full">
      <div className="flex items-baseline justify-between mb-4">
        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
          Skin
        </h3>
        <span className="text-xs text-neutral-600">pick your runner</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {SKIN_LIST.map((s) => {
          const active = skin === s.id;
          const stand = `${s.characterFolder}/${s.filePrefix}_stand.png`;
          const walk1 = `${s.characterFolder}/${s.filePrefix}_walk1.png`;
          const walk2 = `${s.characterFolder}/${s.filePrefix}_walk2.png`;
          return (
            <button
              key={s.id}
              onClick={() => setSkin(s.id)}
              className={`group relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                active
                  ? "border-emerald-500 ring-2 ring-emerald-500/30 scale-[1.02] shadow-lg shadow-emerald-500/10"
                  : "border-neutral-800 hover:border-neutral-600 hover:scale-[1.01]"
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-neutral-800 via-neutral-900 to-neutral-950" />
              <div
                className="absolute inset-x-4 bottom-0 h-1/3 rounded-t-full blur-2xl opacity-30"
                style={{ background: `radial-gradient(ellipse at center, #ffffff 0%, transparent 70%)` }}
              />

              <div className="absolute inset-0 flex items-end justify-center pb-16">
                <div className="relative h-32 w-24 flex items-end justify-center">
                  {/* default stand */}
                  <img
                    src={stand}
                    alt={s.label}
                    className="h-full w-auto object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] transition-opacity duration-150 group-hover:opacity-0"
                    draggable={false}
                  />
                  {/* run animation on hover: walk1 + walk2 alternate */}
                  <img
                    src={walk1}
                    alt=""
                    className="absolute inset-0 m-auto h-full w-auto object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] opacity-0 group-hover:animate-[skinRunA_0.3s_steps(1,end)_infinite]"
                    draggable={false}
                  />
                  <img
                    src={walk2}
                    alt=""
                    className="absolute inset-0 m-auto h-full w-auto object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] opacity-0 group-hover:animate-[skinRunB_0.3s_steps(1,end)_infinite]"
                    draggable={false}
                  />
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-3 text-center bg-gradient-to-t from-black/80 to-transparent">
                <div className="font-bold text-white text-sm">{s.label}</div>
                <div className="text-[11px] text-neutral-400 mt-0.5 line-clamp-1">{s.description}</div>
              </div>

              {active && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
