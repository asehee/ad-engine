// src/core/types.ts
export interface Vector2D {
    x: number;
    y: number;
  }
  
  export interface GameObjectConfig {
    name?: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    visible?: boolean;
  }
  
  export interface EngineConfig {
    container: HTMLElement;
    width: number;
    height: number;
    debug?: boolean;
  }