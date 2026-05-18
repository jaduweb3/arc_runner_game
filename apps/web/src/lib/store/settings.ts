"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ThemeId } from "@/lib/game/themes";
import type { SkinId } from "@/lib/game/skins";

type SettingsState = {
  theme: ThemeId;
  skin: SkinId;
  setTheme: (t: ThemeId) => void;
  setSkin: (s: SkinId) => void;
};

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "arc",
      skin: "default",
      setTheme: (theme) => set({ theme }),
      setSkin: (skin) => set({ skin }),
    }),
    { name: "arc-arcade-settings", version: 1 },
  ),
);
