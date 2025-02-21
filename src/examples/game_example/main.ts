// src/examples/game_example/main.ts
import { Engine, Scene, GameObject, Component } from '../../core';

// 마우스 입력으로 제어되는 컴포넌트
class DraggableComponent extends Component {
  private isDragging: boolean = false;
  private dragOffset: { x: number; y: number } = { x: 0, y: 0 };

  update(deltaTime: number): void {
    const gameObject = this.gameObject!;
    const engine = gameObject.scene?.engine as Engine;
    if (!engine) return;

    // 마우스가 눌렸을 때
    if (engine.input.isPointerDown() && !this.isDragging) {
      const mousePos = engine.input.getPosition();
      
      // 마우스가 오브젝트 영역 안에 있는지 확인
      if (this.isPointInObject(mousePos)) {
        this.isDragging = true;
        this.dragOffset.x = gameObject.x - mousePos.x;
        this.dragOffset.y = gameObject.y - mousePos.y;
      }
    }

    // 드래그 중인 경우
    if (this.isDragging) {
      if (engine.input.isPointerDown()) {
        const mousePos = engine.input.getPosition();
        gameObject.x = mousePos.x + this.dragOffset.x;
        gameObject.y = mousePos.y + this.dragOffset.y;
      } else {
        this.isDragging = false;
      }
    }
  }

  private isPointInObject(point: { x: number; y: number }): boolean {
    const gameObject = this.gameObject!;
    return (
      point.x >= gameObject.x - gameObject.width / 2 &&
      point.x <= gameObject.x + gameObject.width / 2 &&
      point.y >= gameObject.y - gameObject.height / 2 &&
      point.y <= gameObject.y + gameObject.height / 2
    );
  }
}

// 오브젝트 렌더링 컴포넌트
class BoxRenderer extends Component {
  private normalColor: string = '#3498db';
  private hoverColor: string = '#2980b9';

  update(deltaTime: number): void {} 

  render(context: CanvasRenderingContext2D): void {
    const gameObject = this.gameObject!;
    const engine = gameObject.scene?.engine as Engine;
    
    const mousePos = engine.input.getPosition();
    const isHovered = this.isPointInObject(mousePos);

    context.fillStyle = isHovered ? this.hoverColor : this.normalColor;
    context.fillRect(
      -gameObject.width / 2,
      -gameObject.height / 2,
      gameObject.width,
      gameObject.height
    );
  }

  private isPointInObject(point: { x: number; y: number }): boolean {
    const gameObject = this.gameObject!;
    return (
      point.x >= gameObject.x - gameObject.width / 2 &&
      point.x <= gameObject.x + gameObject.width / 2 &&
      point.y >= gameObject.y - gameObject.height / 2 &&
      point.y <= gameObject.y + gameObject.height / 2
    );
  }
}

// 게임 씬 설정
class GameScene extends Scene {
  async onLoad(): Promise<void> {
    // 드래그 가능한 상자 생성
    const box = new GameObject({
      name: 'draggableBox',
      x: 400,
      y: 300,
      width: 100,
      height: 100
    });

    box.addComponent(new BoxRenderer());
    box.addComponent(new DraggableComponent());
    this.addObject(box);
  }
}

// 게임 시작
const container = document.getElementById('game-container');
if (!container) throw new Error('Game container not found');

const engine = new Engine({
  container,
  width: 800,
  height: 600,
  debug: true
});

async function startGame() {
  await engine.initialize();
  engine.addScene('game', new GameScene(engine));
  await engine.loadScene('game');
  engine.start();
}

startGame().catch(console.error);