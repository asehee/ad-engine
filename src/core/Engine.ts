// src/core/Engine.ts
import { InputManager } from '@/input/InputManager';
import { Scene } from './Scene';
import { Time } from './Time';
import { EngineConfig } from './types';
import EventEmitter from 'eventemitter3';

export class Engine extends EventEmitter {
 private config: EngineConfig;
 private scenes: Map<string, Scene>;
 private currentScene: Scene | null;
 private time: Time;
 private running: boolean;
 private canvas: HTMLCanvasElement;
 private context: CanvasRenderingContext2D;
 private rafId: number | null;
 private fpsCounter: number;
 private fpsTime: number;
 private fps: number;
 public readonly input: InputManager;

 constructor(config: EngineConfig) {
   super();
   this.config = config;
   this.scenes = new Map();
   this.currentScene = null;
   this.time = new Time();
   this.running = false;
   this.rafId = null;
   this.fpsCounter = 0;
   this.fpsTime = 0;
   this.fps = 0;

   // Canvas 설정
   this.canvas = document.createElement('canvas');
   this.canvas.width = config.width;
   this.canvas.height = config.height;
   this.context = this.canvas.getContext('2d')!;
   config.container.appendChild(this.canvas);

   // Input Manager 초기화
   this.input = new InputManager(this.canvas);

   // 이벤트 리스너 설정
   window.addEventListener('resize', this.handleResize.bind(this));
 }

 async initialize(): Promise<void> {
   try {
     this.emit('initialize');
     // 추가적인 초기화 로직
     this.emit('initialized');
   } catch (error) {
     this.emit('error', error);
     throw error;
   }
 }

 start(): void {
   if (this.running) return;
   
   this.running = true;
   this.time.reset();
   this.gameLoop();
   this.emit('start');
 }

 stop(): void {
   if (!this.running) return;

   this.running = false;
   if (this.rafId !== null) {
     cancelAnimationFrame(this.rafId);
     this.rafId = null;
   }
   this.emit('stop');
 }

 pause(): void {
   if (!this.running) return;
   this.running = false;
   this.emit('pause');
 }

 resume(): void {
   if (this.running) return;
   this.running = true;
   this.gameLoop();
   this.emit('resume');
 }

 private gameLoop(): void {
   if (!this.running) return;

   // 시간 업데이트
   this.time.update();

   // Input 업데이트
   this.input.update();

   // FPS 계산
   this.fpsCounter++;
   this.fpsTime += this.time.deltaTime;
   if (this.fpsTime >= 1) {
     this.fps = this.fpsCounter;
     this.fpsCounter = 0;
     this.fpsTime -= 1;
   }

   // 현재 씬 업데이트
   if (this.currentScene) {
     this.currentScene.update(this.time.deltaTime);
   }

   // 렌더링
   this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
   if (this.currentScene) {
     this.currentScene.render(this.context);
   }

   // 디버그 정보
   if (this.config.debug) {
     this.renderDebugInfo();
   }

   // 다음 프레임 요청
   this.rafId = requestAnimationFrame(() => this.gameLoop());
 }

 private renderDebugInfo(): void {
   const ctx = this.context;
   ctx.save();
   ctx.fillStyle = 'white';
   ctx.font = '12px monospace';
   ctx.fillText(`FPS: ${this.fps}`, 10, 20);
   ctx.fillText(`Objects: ${this.currentScene?.objectCount || 0}`, 10, 40);
   const pos = this.input.getPosition();
   ctx.fillText(`Mouse: (${Math.round(pos.x)}, ${Math.round(pos.y)})`, 10, 60);
   ctx.restore();
 }

 private handleResize(): void {
   const containerBounds = this.config.container.getBoundingClientRect();
   const scale = Math.min(
     containerBounds.width / this.config.width,
     containerBounds.height / this.config.height
   );

   this.canvas.style.transform = `scale(${scale})`;
   this.canvas.style.transformOrigin = 'top left';
   
   this.emit('resize', { scale });
 }

 // 씬 관리
 addScene(name: string, scene: Scene): void {
   this.scenes.set(name, scene);
 }

 async loadScene(name: string): Promise<void> {
   const scene = this.scenes.get(name);
   if (!scene) {
     throw new Error(`Scene ${name} not found`);
   }

   if (this.currentScene) {
     this.currentScene.onExit();
   }

   await scene.load();
   this.currentScene = scene;
   scene.onEnter();
   this.emit('sceneLoaded', name);
 }

 // Getters
 get deltaTime(): number {
   return this.time.deltaTime;
 }

 get elapsedTime(): number {
   return this.time.elapsed;
 }

 get currentFPS(): number {
   return this.fps;
 }

 get canvasElement(): HTMLCanvasElement {
   return this.canvas;
 }

 get canvasContext(): CanvasRenderingContext2D {
   return this.context;
 }
}