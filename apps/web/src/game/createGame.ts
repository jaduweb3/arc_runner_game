import Phaser from "phaser";
import { BootScene } from "./scenes/BootScene";
import { GameScene, GAME_CONFIG } from "./scenes/GameScene";
import type { ThemeConfig } from "@/lib/game/themes";
import type { SkinConfig } from "@/lib/game/skins";

export function createGame(
  parent: HTMLElement,
  opts: { theme: ThemeConfig; skin: SkinConfig },
) {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: GAME_CONFIG.GAME_WIDTH,
    height: GAME_CONFIG.GAME_HEIGHT,
    backgroundColor: opts.theme.background,
    physics: {
      default: "arcade",
      arcade: { gravity: { x: 0, y: 1400 }, debug: false },
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [BootScene, GameScene],
  });
  game.registry.set("theme", opts.theme);
  game.registry.set("skin", opts.skin);
  return game;
}
