// src/core/Scene.ts
import type { GameObject } from './GameObject';
import type { Engine } from './Engine';
import EventEmitter from 'eventemitter3';

export abstract class Scene extends EventEmitter {
private _engine: Engine;  // private로 변경
 protected objects: Set<GameObject>;
 protected loaded: boolean;

 constructor(engine: Engine) {
   super();
   this._engine = engine;
   this.objects = new Set();
   this.loaded = false;
 }
 get engine(): Engine {
    return this._engine;
  }
 // 씬 생명주기 메서드
 async load(): Promise<void> {
   if (this.loaded) return;
   
   try {
     await this.onLoad();
     this.loaded = true;
     this.emit('loaded');
   } catch (error) {
     this.emit('error', error);
     throw error;
   }
 }

 unload(): void {
   this.objects.clear();
   this.loaded = false;
   this.onUnload();
   this.emit('unloaded');
 }

 // 게임 오브젝트 관리
 addObject(object: GameObject): void {
    this.objects.add(object);
    object.scene = this;  // GameObject에 Scene 참조 설정
    this.emit('objectAdded', object);
  }

  removeObject(object: GameObject): void {
    if (this.objects.delete(object)) {
      object.scene = null;  // Scene 참조 제거
      this.emit('objectRemoved', object);
    }
  }

 // 업데이트 및 렌더링
 update(deltaTime: number): void {
   for (const object of this.objects) {
     object.update(deltaTime);
   }
 }

 render(context: CanvasRenderingContext2D): void {
   for (const object of this.objects) {
     object.render(context);
   }
 }

 // 이벤트 핸들러
 onEnter(): void {
   // 씬이 활성화될 때 호출됨
   this.emit('enter');
 }

 onExit(): void {
   // 씬이 비활성화될 때 호출됨
   this.emit('exit');
 }

 protected abstract onLoad(): Promise<void>;
 
 protected onUnload(): void {
   // 씬 리소스 정리 등을 수행할 수 있음
   this.emit('unload');
 }

 // 씬 내 오브젝트 검색
 findObjectByName(name: string): GameObject | undefined {
   for (const object of this.objects) {
     if (object.name === name) {
       return object;
     }
   }
   return undefined;
 }

 findObjectsByTag(tag: string): GameObject[] {
   return Array.from(this.objects).filter(object => object.hasTag?.(tag));
 }

 // 씬의 모든 오브젝트에 대해 작업 수행
 forEach(callback: (object: GameObject) => void): void {
   this.objects.forEach(callback);
 }

 // 씬 상태 관리
 pause(): void {
   this.emit('pause');
 }

 resume(): void {
   this.emit('resume');
 }

 // Getters
 get objectCount(): number {
   return this.objects.size;
 }

 get isLoaded(): boolean {
   return this.loaded;
 }

 get allObjects(): GameObject[] {
   return Array.from(this.objects);
 }
}