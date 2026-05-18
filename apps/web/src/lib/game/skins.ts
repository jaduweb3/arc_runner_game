export type SkinId = "default" | "robot" | "builder";

export type SkinConfig = {
  id: SkinId;
  label: string;
  bodyColor: number;
  accentColor: number;
  description: string;
  characterFolder: string;
  filePrefix: string;
};

const CHAR_PACK = "/assets/kenney/kenney_platformer-characters/PNG";

export const SKINS: Record<SkinId, SkinConfig> = {
  default: {
    id: "default",
    label: "Default",
    bodyColor: 0x4ade80,
    accentColor: 0x166534,
    description: "Classic green-shirt runner",
    characterFolder: `${CHAR_PACK}/Player/Poses`,
    filePrefix: "player",
  },
  robot: {
    id: "robot",
    label: "Soldier",
    bodyColor: 0x60a5fa,
    accentColor: 0xfbbf24,
    description: "Tactical gear, ready to dash",
    characterFolder: `${CHAR_PACK}/Soldier/Poses`,
    filePrefix: "soldier",
  },
  builder: {
    id: "builder",
    label: "Adventurer",
    bodyColor: 0xfbbf24,
    accentColor: 0xb45309,
    description: "Explorer outfit, hat included",
    characterFolder: `${CHAR_PACK}/Adventurer/Poses`,
    filePrefix: "adventurer",
  },
};

export const SKIN_LIST: SkinConfig[] = [SKINS.default, SKINS.robot, SKINS.builder];
