"use client";

import { useEffect, useRef, useState } from "react";
import type Phaser from "phaser";
import { useSettings } from "@/lib/store/settings";
import { THEMES } from "@/lib/game/themes";
import { SKINS } from "@/lib/game/skins";

type Props = {
  onGameStart?: () => void;
  onGameOver?: (score: number) => void;
};

export function GameContainer({ onGameStart, onGameOver }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const [ready, setReady] = useState(false);
  const themeId = useSettings((s) => s.theme);
  const skinId = useSettings((s) => s.skin);

  useEffect(() => {
    if (!hostRef.current) return;

    let cancelled = false;
    setReady(false);

    (async () => {
      const { createGame } = await import("@/game/createGame");
      if (cancelled || !hostRef.current) return;
      const game = createGame(hostRef.current, {
        theme: THEMES[themeId],
        skin: SKINS[skinId],
      });
      gameRef.current = game;
      if (onGameStart) game.events.on("game:start", onGameStart);
      if (onGameOver) game.events.on("game:over", onGameOver);
      setReady(true);
    })();

    return () => {
      cancelled = true;
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [onGameStart, onGameOver, themeId, skinId]);

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <div
        ref={hostRef}
        className="w-full max-w-[800px] aspect-[2/1] bg-black rounded-lg overflow-hidden shadow-lg"
      />
      {!ready && <div className="text-sm text-neutral-400">Loading game…</div>}
    </div>
  );
}
