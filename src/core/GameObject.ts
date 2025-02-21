// src/core/GameObject.ts
import { Component } from './Component';
import { Scene } from './Scene';
import { GameObjectConfig } from './types';
import EventEmitter from 'eventemitter3';

export class GameObject extends EventEmitter {
  protected _name: string;
  protected _components: Map<string, Component>;
  protected _children: Set<GameObject>;
  protected _parent: GameObject | null;
  protected _tags: Set<string>;
  
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public visible: boolean;
  public scale: { x: number; y: number };
  public rotation: number;
  protected _scene: Scene | null; // Scene 참조 추가

  constructor(config: GameObjectConfig = {}) {
    super();
    this._name = config.name || 'GameObject';
    this._components = new Map();
    this._children = new Set();
    this._parent = null;
    this._tags = new Set();
    this._scene = null;  // 초기화

    this.x = config.x || 0;
    this.y = config.y || 0;
    this.width = config.width || 0;
    this.height = config.height || 0;
    this.visible = config.visible ?? true;
    this.scale = { x: 1, y: 1 };
    this.rotation = 0;
  }

  get scene(): Scene | null {
    return this._scene;
  }

  set scene(scene: Scene | null) {
    this._scene = scene;
  }
  
  // 컴포넌트 관리
  addComponent<T extends Component>(component: T): T {
    const componentName = component.constructor.name;
    if (this._components.has(componentName)) {
      throw new Error(`Component ${componentName} already exists on ${this._name}`);
    }

    this._components.set(componentName, component);
    component.onAttach(this);
    this.emit('componentAdded', component);
    return component;
  }

  getComponent<T extends Component>(componentType: new (...args: any[]) => T): T | null {
    const componentName = componentType.name;
    return (this._components.get(componentName) as T) || null;
  }

  removeComponent(componentType: new (...args: any[]) => Component): void {
    const componentName = componentType.name;
    const component = this._components.get(componentName);
    if (component) {
      component.onDetach();
      this._components.delete(componentName);
      this.emit('componentRemoved', component);
    }
  }

  // 계층 구조 관리
  addChild(child: GameObject): void {
    if (child._parent) {
      child._parent.removeChild(child);
    }
    this._children.add(child);
    child._parent = this;
    this.emit('childAdded', child);
  }

  removeChild(child: GameObject): void {
    if (this._children.delete(child)) {
      child._parent = null;
      this.emit('childRemoved', child);
    }
  }

  // 태그 관리
  addTag(tag: string): void {
    this._tags.add(tag);
  }

  removeTag(tag: string): void {
    this._tags.delete(tag);
  }

  hasTag(tag: string): boolean {
    return this._tags.has(tag);
  }

  // 트랜스폼 관리
  setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.emit('positionChanged', { x, y });
  }

  setScale(x: number, y: number): void {
    this.scale.x = x;
    this.scale.y = y;
    this.emit('scaleChanged', this.scale);
  }

  setRotation(angle: number): void {
    this.rotation = angle;
    this.emit('rotationChanged', angle);
  }

  // 업데이트 및 렌더링
  update(deltaTime: number): void {
    if (!this.visible) return;

    // 컴포넌트 업데이트
    for (const component of this._components.values()) {
      component.update(deltaTime);
    }

    // 자식 업데이트
    for (const child of this._children) {
      child.update(deltaTime);
    }
  }

  render(context: CanvasRenderingContext2D): void {
    if (!this.visible) return;

    context.save();
    
    // 트랜스폼 적용
    context.translate(this.x, this.y);
    context.rotate(this.rotation);
    context.scale(this.scale.x, this.scale.y);

    // 컴포넌트 렌더링
    for (const component of this._components.values()) {
      component.render(context);
    }

    // 자식 렌더링
    for (const child of this._children) {
      child.render(context);
    }

    context.restore();
  }

  // 좌표 변환
  getWorldPosition(): { x: number; y: number } {
    let worldX = this.x;
    let worldY = this.y;
    let current = this._parent;

    while (current) {
      worldX += current.x;
      worldY += current.y;
      current = current._parent;
    }

    return { x: worldX, y: worldY };
  }

  // 충돌 검사
  getBounds(): { x: number; y: number; width: number; height: number } {
    const worldPos = this.getWorldPosition();
    return {
      x: worldPos.x,
      y: worldPos.y,
      width: this.width * this.scale.x,
      height: this.height * this.scale.y
    };
  }

  // Getters
  get name(): string {
    return this._name;
  }

  get parent(): GameObject | null {
    return this._parent;
  }

  get children(): GameObject[] {
    return Array.from(this._children);
  }

  get components(): Component[] {
    return Array.from(this._components.values());
  }
}