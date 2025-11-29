// src/main.js
import Phaser from "phaser";
import { GameScene } from "./scenes/GameScene";

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 450,
  backgroundColor: "#222222",
  parent: "game-container", // index.html 에 <div id="game-container"></div> 있다고 가정
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 0 }, // 위아래로 직접 움직이므로 중력 없음
      debug: false,
    },
  },
  scene: [GameScene],
};

new Phaser.Game(config);