import Phaser from "phaser";
import type { ThemeConfig } from "@/lib/game/themes";
import type { SkinConfig } from "@/lib/game/skins";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    const theme = this.registry.get("theme") as ThemeConfig;
    const skin = this.registry.get("skin") as SkinConfig;

    this.load.image("bg", theme.bgImage);
    this.load.image("ground", theme.groundTile);
    theme.obstacles.forEach((src, i) => {
      this.load.image(`obstacle_${i}`, src);
    });

    const POSES = ["stand", "walk1", "walk2", "jump", "hurt", "duck"];
    POSES.forEach((p) => {
      this.load.image(`player_${p}`, `${skin.characterFolder}/${skin.filePrefix}_${p}.png`);
    });
  }

  create() {
    this.scene.start("GameScene");
  }
}
