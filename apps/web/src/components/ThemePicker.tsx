"use client";

import { useSettings } from "@/lib/store/settings";
import { THEME_LIST } from "@/lib/game/themes";

export function ThemePicker() {
  const theme = useSettings((s) => s.theme);
  const setTheme = useSettings((s) => s.setTheme);

  return (
    <section className="w-full">
      <div className="flex items-baseline justify-between mb-4">
        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
          Theme
        </h3>
        <span className="text-xs text-neutral-600">choose your world</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {THEME_LIST.map((t) => {
          const active = theme === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`group relative aspect-[16/10] rounded-xl overflow-hidden border-2 transition-all duration-200 text-left ${
                active
                  ? "border-emerald-500 ring-2 ring-emerald-500/30 scale-[1.02] shadow-lg shadow-emerald-500/10"
                  : "border-neutral-800 hover:border-neutral-600 hover:scale-[1.01]"
              }`}
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                style={{ backgroundImage: `url(${t.bgImage})` }}
              />
              <div className="absolute inset-x-0 bottom-0 h-2 bg-cover bg-bottom opacity-90"
                style={{ backgroundImage: `url(${t.groundTile})`, height: "30%" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="font-bold text-white text-base">{t.label}</div>
                  {active && (
                    <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded">
                      Selected
                    </span>
                  )}
                </div>
                <div className="text-xs text-neutral-300/90">{t.description}</div>
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
