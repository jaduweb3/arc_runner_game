import Phaser from "phaser";
import type { ThemeConfig } from "@/lib/game/themes";

const GAME_WIDTH = 800;
const GAME_HEIGHT = 400;
const GROUND_Y = 360;
const JUMP_VELOCITY = -680;
const GRAVITY = 1500;
const INITIAL_SPEED = 280;
const SPEED_RAMP = 6;
const MAX_SPEED = 600;
const PLAYER_SCALE = 0.75;
const OBSTACLE_SCALE = 0.45;

export class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private obstacles!: Phaser.Physics.Arcade.Group;
  private ground!: Phaser.GameObjects.TileSprite;
  private bg!: Phaser.GameObjects.TileSprite;
  private scoreText!: Phaser.GameObjects.Text;
  private score = 0;
  private speed = INITIAL_SPEED;
  private spawnTimer = 0;
  private nextSpawn = 1500;
  private gameOver = false;
  private numObstacleVariants = 1;

  constructor() {
    super("GameScene");
  }

  create() {
    this.score = 0;
    this.speed = INITIAL_SPEED;
    this.gameOver = false;
    this.spawnTimer = 0;
    this.nextSpawn = 1500;

    const theme = this.registry.get("theme") as ThemeConfig;
    this.numObstacleVariants = theme.obstacles.length;
    this.cameras.main.setBackgroundColor(theme.background);

    this.bg = this.add
      .tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, "bg")
      .setOrigin(0, 0)
      .setScrollFactor(0);
    const bgTex = this.textures.get("bg").getSourceImage() as HTMLImageElement;
    if (bgTex.height) this.bg.setTileScale(1, GAME_HEIGHT / bgTex.height);

    this.physics.world.gravity.y = GRAVITY;
    this.physics.world.setBounds(0, 0, GAME_WIDTH, GROUND_Y);

    this.ground = this.add
      .tileSprite(0, GROUND_Y, GAME_WIDTH * 2, 40, "ground")
      .setOrigin(0, 0);

    this.anims.create({
      key: "run",
      frames: [{ key: "player_walk1" }, { key: "player_walk2" }],
      frameRate: 10,
      repeat: -1,
    });

    this.player = this.physics.add.sprite(120, GROUND_Y - 60, "player_stand");
    this.player.setOrigin(0.5, 1);
    this.player.setScale(PLAYER_SCALE);
    this.player.setCollideWorldBounds(true);
    this.player.y = GROUND_Y;
    const pBody = this.player.body as Phaser.Physics.Arcade.Body;
    pBody.setSize(this.player.width * 0.5, this.player.height * 0.85);
    pBody.setOffset(this.player.width * 0.25, this.player.height * 0.15);
    this.player.play("run");

    this.obstacles = this.physics.add.group();
    this.physics.add.collider(this.player, this.obstacles, () => this.handleGameOver());

    this.scoreText = this.add.text(16, 16, "Score: 0", {
      fontFamily: "monospace",
      fontSize: "22px",
      color: theme.textColor,
      stroke: "#000000",
      strokeThickness: 3,
    });

    this.input.keyboard?.on("keydown-SPACE", () => this.jump());
    this.input.keyboard?.on("keydown-UP", () => this.jump());
    this.input.on("pointerdown", () => this.jump());

    this.game.events.emit("game:start");
  }

  private jump() {
    if (this.gameOver) {
      this.scene.restart();
      return;
    }
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    if (body.blocked.down) {
      this.player.setVelocityY(JUMP_VELOCITY);
    }
  }

  update(_time: number, delta: number) {
    if (this.gameOver) return;

    this.bg.tilePositionX += (this.speed * 0.15 * delta) / 1000;
    this.ground.tilePositionX += (this.speed * delta) / 1000;
    this.speed = Math.min(MAX_SPEED, this.speed + (SPEED_RAMP * delta) / 1000);

    const body = this.player.body as Phaser.Physics.Arcade.Body;
    if (body.blocked.down) {
      if (!this.player.anims.isPlaying) this.player.play("run");
    } else {
      if (this.player.anims.isPlaying) this.player.anims.stop();
      this.player.setTexture("player_jump");
    }

    this.spawnTimer += delta;
    if (this.spawnTimer >= this.nextSpawn) {
      this.spawnObstacle();
      this.spawnTimer = 0;
      this.nextSpawn = Phaser.Math.Between(900, 1800) * (INITIAL_SPEED / this.speed);
    }

    this.obstacles.getChildren().forEach((obj) => {
      const o = obj as Phaser.Physics.Arcade.Sprite;
      o.x -= (this.speed * delta) / 1000;
      if (o.x < -50) o.destroy();
    });

    this.score += delta / 100;
    this.scoreText.setText(`Score: ${Math.floor(this.score)}`);
  }

  private spawnObstacle() {
    const variant = Phaser.Math.Between(0, Math.max(0, this.numObstacleVariants - 1));
    const o = this.obstacles.create(GAME_WIDTH + 30, GROUND_Y, `obstacle_${variant}`) as Phaser.Physics.Arcade.Sprite;
    o.setOrigin(0.5, 1);
    o.setScale(OBSTACLE_SCALE);
    const body = o.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    body.setSize(o.width * 0.7, o.height * 0.8);
  }

  private handleGameOver() {
    if (this.gameOver) return;
    this.gameOver = true;
    this.physics.pause();
    this.player.anims.stop();
    this.player.setTexture("player_hurt");

    const finalScore = Math.floor(this.score);
    this.game.events.emit("game:over", finalScore);

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, `Game Over\nScore: ${finalScore}\nTap or Space to restart`, {
        fontFamily: "monospace",
        fontSize: "22px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 4,
        align: "center",
      })
      .setOrigin(0.5);
  }
}

export const GAME_CONFIG = { GAME_WIDTH, GAME_HEIGHT };
