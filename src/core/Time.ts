// src/core/Time.ts
export class Time {
    private lastTime: number;
    private _deltaTime: number;
    private _elapsed: number;
  
    constructor() {
      this.lastTime = 0;
      this._deltaTime = 0;
      this._elapsed = 0;
    }
  
    reset(): void {
      this.lastTime = performance.now();
      this._deltaTime = 0;
      this._elapsed = 0;
    }
  
    update(): void {
      const currentTime = performance.now();
      this._deltaTime = (currentTime - this.lastTime) / 1000; // 초 단위로 변환
      this._elapsed += this._deltaTime;
      this.lastTime = currentTime;
    }
  
    get deltaTime(): number {
      return this._deltaTime;
    }
  
    get elapsed(): number {
      return this._elapsed;
    }
  }