export type ThemeId = "arc" | "jungle" | "space";

export type ThemeConfig = {
  id: ThemeId;
  label: string;
  background: number;
  groundColor: number;
  obstacleColor: number;
  textColor: string;
  description: string;
  bgImage: string;
  groundTile: string;
  obstacles: string[];
};

const PACK = "/assets/kenney/kenney_platformer-pack-remastered/PNG";

export const THEMES: Record<ThemeId, ThemeConfig> = {
  arc: {
    id: "arc",
    label: "Arc / Crypto",
    background: 0x0a0a0a,
    groundColor: 0x404040,
    obstacleColor: 0xef4444,
    textColor: "#ffffff",
    description: "Neon dark — the default Arc vibe",
    bgImage: `${PACK}/Backgrounds/blue_desert.png`,
    groundTile: `${PACK}/Ground/Stone/stone.png`,
    obstacles: [`${PACK}/Tiles/rock.png`, `${PACK}/Tiles/bomb.png`],
  },
  jungle: {
    id: "jungle",
    label: "Jungle",
    background: 0x065f46,
    groundColor: 0x422006,
    obstacleColor: 0xd97706,
    textColor: "#fde68a",
    description: "Green canopy, rocks and cactus hazards",
    bgImage: `${PACK}/Backgrounds/blue_grass.png`,
    groundTile: `${PACK}/Ground/Grass/grass.png`,
    obstacles: [`${PACK}/Tiles/cactus.png`, `${PACK}/Tiles/bush.png`],
  },
  space: {
    id: "space",
    label: "Space",
    background: 0x0c0a1f,
    groundColor: 0x312e81,
    obstacleColor: 0xa78bfa,
    textColor: "#e9d5ff",
    description: "Alien planet with spike traps",
    bgImage: `${PACK}/Backgrounds/blue_shroom.png`,
    groundTile: `${PACK}/Ground/Planet/planet.png`,
    obstacles: [`${PACK}/Tiles/spikes.png`, `${PACK}/Tiles/rock.png`],
  },
};

export const THEME_LIST: ThemeConfig[] = [THEMES.arc, THEMES.jungle, THEMES.space];
