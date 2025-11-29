import Phaser from "phaser";

export default class HelloScene extends Phaser.Scene {
  private helloText!: Phaser.GameObjects.Text;

  constructor() {
    super("hello-scene");
  }

  create() {
    const { width, height } = this.scale;

    this.helloText = this.add.text(width / 2, height / 2, "Hello, Phaser + Vite!", {
      fontFamily: "system-ui, sans-serif",
      fontSize: "40px",
      color: "#ffffff",
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 60, "Click to change text color", {
      fontSize: "18px",
      color: "#cccccc",
    }).setOrigin(0.5);

    this.input.on("pointerdown", () => {
      const c = Phaser.Display.Color.RandomRGB();
      this.helloText.setColor(`#${c.color.toString(16).padStart(6, "0")}`);
    });
  }
}
