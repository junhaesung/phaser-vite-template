// src/scenes/GameScene.js
import Phaser from "phaser";

export class GameScene extends Phaser.Scene {
  background!: Phaser.GameObjects.TileSprite;
  player!: Phaser.Physics.Arcade.Sprite;
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  items!: Phaser.Physics.Arcade.Group;
  scoreText!: Phaser.GameObjects.Text;
  hpText!: Phaser.GameObjects.Text;
  itemTimer!: Phaser.Time.TimerEvent;
  playerSpeed!: number;
  score: number = 0;
  hp: number = 3;

  constructor() {
    super("GameScene");
  }

  preload() {
    // 여기서는 에셋 파일 없이, runtime에서 간단한 텍스처를 만들어 쓸 거야

    // 플레이어용 텍스처 (파란 사각형)
    const playerGfx = this.add.graphics({ x: 0, y: 0 });
    playerGfx.fillStyle(0x4dabf7, 1);
    playerGfx.fillRect(0, 0, 40, 40);
    playerGfx.generateTexture("player-box", 40, 40);
    playerGfx.destroy();

    // 좋은 아이템 (초록색 원)
    const goodGfx = this.add.graphics({ x: 0, y: 0 });
    goodGfx.fillStyle(0x51cf66, 1);
    goodGfx.fillCircle(15, 15, 15);
    goodGfx.generateTexture("item-good", 30, 30);
    goodGfx.destroy();

    // 나쁜 아이템 (빨간색 삼각형 느낌)
    const badGfx = this.add.graphics({ x: 0, y: 0 });
    // 색깔 : 빨간색
    badGfx.fillStyle(0xff6b6b, 1);
    badGfx.beginPath();
    badGfx.moveTo(0, 30);
    badGfx.lineTo(30, 30);
    badGfx.lineTo(15, 0);
    badGfx.closePath();
    badGfx.fillPath();
    badGfx.generateTexture("item-bad", 30, 30);
    badGfx.destroy();

    // 단순 패턴 배경 텍스처
    const bgGfx = this.add.graphics({ x: 0, y: 0 });
    // 색깔 : 어두운 회색 계열
    bgGfx.fillStyle(0x343a40, 1);
    bgGfx.fillRect(0, 0, 64, 64);
    // 색깔 : 밝은 회색 계열
    bgGfx.fillStyle(0x495057, 1);
    bgGfx.fillRect(0, 0, 64, 10);
    bgGfx.fillRect(0, 54, 64, 10);
    bgGfx.generateTexture("bg-tile", 64, 64);
    bgGfx.destroy();
  }

  create() {
    const { width, height } = this.scale;

    // 배경: tileSprite 로 오른쪽->왼쪽 스크롤
    this.background = this.add.tileSprite(0, 0, width, height, "bg-tile")
      .setOrigin(0, 0)
      .setScrollFactor(0);

    // 플레이어 설정
    this.player = this.physics.add
      .sprite(100, height / 2, "player-box")
      .setCollideWorldBounds(true);

    this.playerSpeed = 250;

    // 키 입력 (위/아래)
    this.cursors = this.input.keyboard!.createCursorKeys();

    // 아이템 그룹
    this.items = this.physics.add.group();

    // 점수 및 HP 같은 상태
    this.score = 0;
    this.hp = 3;

    // 텍스트 UI
    this.scoreText = this.add
      .text(16, 16, "Score: 0", {
        fontSize: "18px",
        color: "#ffffff",
      })
      .setScrollFactor(0);

    this.hpText = this.add
      .text(16, 40, "HP: 3", {
        fontSize: "18px",
        color: "#ff6b6b",
      })
      .setScrollFactor(0);

    // 일정 간격으로 아이템 생성
    this.itemTimer = this.time.addEvent({
      delay: 900, // ms
      loop: true,
      callback: () => this.spawnItem(),
    });

    // 플레이어와 아이템 겹침 처리
    this.physics.add.overlap(
      this.player,
      this.items,
      (player, item) =>
        this.handleItemCollision(
          player as Phaser.Physics.Arcade.Sprite,
          item as Phaser.Physics.Arcade.Sprite & { isGood?: boolean }
        ),
      undefined,
      this
    );
  }

  update(time: number, delta: number): void {
    // 배경 스크롤
    this.background.tilePositionX += 0.3 * (delta / 16.67); // 프레임 보정용

    // 플레이어 이동 처리
    this.handlePlayerMovement();

    // 화면 밖으로 나간 아이템 정리
    this.items.children.each((child) => {
      const item = child as Phaser.Physics.Arcade.Sprite;
      if (item.x < -50) {
        item.destroy();
      }
      return true;
    }, this);
  }

  handlePlayerMovement() {
    this.player.setVelocity(0, 0);

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-this.playerSpeed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(this.playerSpeed);
    }

    // 필요하면 y 범위 추가 제한도 가능 (UI 영역 제외 등)
  }

  spawnItem() {
    const { width, height } = this.scale;

    // 랜덤 위치 (위/아래 너무 끝은 피해서)
    const y = Phaser.Math.Between(50, height - 50);

    // 좋은 아이템 or 나쁜 아이템 선택 (대충 60%: 좋은, 40%: 나쁜)
    const isGood = Math.random() < 0.6;
    const textureKey = isGood ? "item-good" : "item-bad";

    const item = this.items
      .create(width + 30, y, textureKey)
      .setVelocityX(-200); // 왼쪽으로 이동

    item.isGood = isGood;
    item.setImmovable(true);
    item.body.allowGravity = false;
  }

  handleItemCollision(
    player: Phaser.Physics.Arcade.Sprite,
    item: Phaser.Physics.Arcade.Sprite & { isGood?: boolean }
  ) {
    if (!item.active) return;

    if (item.isGood) {
      this.score += 10;
      this.scoreText.setText(`Score: ${this.score}`);
    } else {
      this.hp -= 1;
      this.hpText.setText(`HP: ${this.hp}`);

      // HP 0 이하이면 일단 게임 정지 상태만
      if (this.hp <= 0) {
        this.gameOver();
      }
    }

    item.destroy();
  }

  gameOver() {
    // 기본 뼈대: 물리 멈추고 텍스트만 표시
    this.physics.pause();
    this.itemTimer.remove(false);

    this.add
      .text(this.scale.width / 2, this.scale.height / 2, "GAME OVER", {
        fontSize: "32px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    // 나중에: R 키로 재시작, 씬 리스타트 등의 로직 추가 가능
  }
}