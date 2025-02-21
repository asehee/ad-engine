// src/core/Component.ts
import type { GameObject } from './GameObject';

export abstract class Component {
  protected gameObject: GameObject | null = null;
  protected enabled: boolean = true;

  constructor() {}

  // 컴포넌트가 게임 오브젝트에 추가될 때 호출
  onAttach(gameObject: GameObject): void {
    this.gameObject = gameObject;
  }

  onDetach(): void {
    this.gameObject = null;
  }

  setEnabled(enabled: boolean): void {
    if (this.enabled !== enabled) {
      this.enabled = enabled;
      if (enabled) {
        this.onEnable();
      } else {
        this.onDisable();
      }
    }
  }

  abstract update(deltaTime: number): void;
  render(context: CanvasRenderingContext2D): void {}
  onEnable(): void {}
  onDisable(): void {}
}