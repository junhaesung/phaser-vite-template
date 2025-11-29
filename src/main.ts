import Phaser from "phaser";
import HelloScene from "./scenes/HelloScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  backgroundColor: "#1d1d1d",
  parent: "game-container",
  width: 800,
  height: 600,
  scene: [HelloScene]
};

new Phaser.Game(config);
