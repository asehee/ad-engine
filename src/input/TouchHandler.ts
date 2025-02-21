// src/core/input/TouchHandler.ts
export interface TouchPoint {
    id: number;
    x: number;
    y: number;
    startX: number;
    startY: number;
  }
  
  export class TouchHandler {
    private touches: Map<number, TouchPoint>;
    private canvas: HTMLCanvasElement;
  
    constructor(canvas: HTMLCanvasElement) {
      this.touches = new Map();
      this.canvas = canvas;
      this.setupListeners();
    }
  
    private setupListeners(): void {
      // 마우스 이벤트
      this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
      this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
      this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
  
      // 터치 이벤트
      this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
      this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
      this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));
    }
  
    private getCanvasPosition(clientX: number, clientY: number): { x: number; y: number } {
      const rect = this.canvas.getBoundingClientRect();
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    }
  
    private handleMouseDown(event: MouseEvent): void {
      const { x, y } = this.getCanvasPosition(event.clientX, event.clientY);
      this.touches.set(0, { id: 0, x, y, startX: x, startY: y });
    }
  
    private handleMouseMove(event: MouseEvent): void {
      if (this.touches.has(0)) {
        const { x, y } = this.getCanvasPosition(event.clientX, event.clientY);
        const touch = this.touches.get(0)!;
        touch.x = x;
        touch.y = y;
      }
    }
  
    private handleMouseUp(): void {
      this.touches.delete(0);
    }
  
    private handleTouchStart(event: TouchEvent): void {
      event.preventDefault();
      Array.from(event.changedTouches).forEach(touch => {
        const { x, y } = this.getCanvasPosition(touch.clientX, touch.clientY);
        this.touches.set(touch.identifier, {
          id: touch.identifier,
          x,
          y,
          startX: x,
          startY: y
        });
      });
    }
  
    private handleTouchMove(event: TouchEvent): void {
      event.preventDefault();
      Array.from(event.changedTouches).forEach(touch => {
        if (this.touches.has(touch.identifier)) {
          const { x, y } = this.getCanvasPosition(touch.clientX, touch.clientY);
          const touchPoint = this.touches.get(touch.identifier)!;
          touchPoint.x = x;
          touchPoint.y = y;
        }
      });
    }
  
    private handleTouchEnd(event: TouchEvent): void {
      event.preventDefault();
      Array.from(event.changedTouches).forEach(touch => {
        this.touches.delete(touch.identifier);
      });
    }
  
    public getTouches(): TouchPoint[] {
      return Array.from(this.touches.values());
    }
  
    public getPrimaryTouch(): TouchPoint | null {
      return this.touches.get(0) || null;
    }
  }