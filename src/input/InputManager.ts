// src/core/input/InputManager.ts
import { TouchHandler, TouchPoint } from './TouchHandler';
import EventEmitter from 'eventemitter3';

export interface InputState {
  position: { x: number; y: number };
  isDown: boolean;
  isDragging: boolean;
}

export class InputManager extends EventEmitter {
  private touchHandler: TouchHandler;
  private currentState: InputState;
  private previousState: InputState;

  constructor(canvas: HTMLCanvasElement) {
    super();
    this.touchHandler = new TouchHandler(canvas);
    
    this.currentState = {
      position: { x: 0, y: 0 },
      isDown: false,
      isDragging: false
    };

    this.previousState = { ...this.currentState };
  }

  update(): void {
    this.previousState = { ...this.currentState };
    const touch = this.touchHandler.getPrimaryTouch();

    if (touch) {
      this.currentState.position.x = touch.x;
      this.currentState.position.y = touch.y;
      this.currentState.isDown = true;

      // 드래그 상태 업데이트
      if (this.previousState.isDown) {
        const dx = touch.x - this.previousState.position.x;
        const dy = touch.y - this.previousState.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        this.currentState.isDragging = distance > 5; // 5픽셀 이상 움직였을 때 드래그로 간주
      }

      // 이벤트 발생
      if (!this.previousState.isDown) {
        this.emit('pointerdown', touch);
      } else if (this.currentState.isDragging) {
        this.emit('pointermove', touch);
      }
    } else {
      if (this.previousState.isDown) {
        this.emit('pointerup', this.previousState.position);
      }
      
      this.currentState.isDown = false;
      this.currentState.isDragging = false;
    }
  }

  // Getter 메서드들
  getPosition(): { x: number; y: number } {
    return { ...this.currentState.position };
  }

  isPointerDown(): boolean {
    return this.currentState.isDown;
  }

  isDragging(): boolean {
    return this.currentState.isDragging;
  }

  // 드래그 시작 위치와 현재 위치의 차이 계산
  getDragDelta(): { x: number; y: number } {
    const touch = this.touchHandler.getPrimaryTouch();
    if (!touch) return { x: 0, y: 0 };

    return {
      x: touch.x - touch.startX,
      y: touch.y - touch.startY
    };
  }

  // 모든 터치 포인트 가져오기 (멀티터치 지원)
  getAllTouches(): TouchPoint[] {
    return this.touchHandler.getTouches();
  }
}