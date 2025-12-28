import { generateUniqueId } from "..";
import { RenderSystem } from "../features/renderer/render-system";
import type { Camera, Entity, Mesh3D, Sprite2D, System, Transform, Velocity } from "../types/type";
import { ComponentStore } from "./component-store";

export class World {
  private scenes: Map<string, Scene> = new Map<string, Scene>();
  private activeSceneIndexes: string[] = [];
  constructor() {}

  createScene(name: string): Scene {
    if (this.scenes.size == 0 && this.activeSceneIndexes.length == 0) {
      this.activeSceneIndexes.push(name);
    }
    let scene = new Scene();
    this.scenes.set(name, scene);
    return scene;
  }

  getActiveScenes(): Scene[] {
    let activeScenes: Scene[] = [];
    this.activeSceneIndexes.forEach((key: string) => {
      let scene = this.scenes.get(key);
      if (scene) {
        activeScenes.push(scene);
      }
    });
    return activeScenes;
  }

  getScene(key: string): Scene | false {
    if (this.scenes.has(key)) {
      return this.scenes.get(key) as Scene;
    } else {
      return false;
    }
  }

  activateScene(name: string) {
    if (this.scenes.has(name) && !this.activeSceneIndexes.includes(name)) {
      this.activeSceneIndexes.push(name);
    }
  }

  deactivateScene(name: string) {
    if (this.activeSceneIndexes.includes(name)) {
      this.activeSceneIndexes = this.activeSceneIndexes.filter((n) => n !== name);
    }
  }
}

export class Scene {
  private entities: Entity[] = [];
  private systems: Map<string, System> = new Map();
  private fixedSystems: Map<string, System> = new Map();
  private drawSystems: Map<string, System> = new Map();
  private componentStores: Map<string, ComponentStore<any>> = new Map();

  constructor() {
    this.registerComponent<Velocity>('velocities');
    this.registerComponent<Transform>('transforms');
    this.registerComponent<Sprite2D>('sprites2D');
    this.registerComponent<Mesh3D>('meshes3D');
    this.registerComponent<Camera>('cameras');
    this.registerSystem<RenderSystem>('renderSystem', new RenderSystem(), 'draw');
  }

  public createEntity(): Entity {
    let entity = '';
    do {
      entity = generateUniqueId();
    } while (this.entities.includes(entity));
    this.entities.push(entity);
    return entity;
  }

  registerComponent<T>(key: string) {
    this.componentStores.set(key, new ComponentStore<T>());
  }

  getComponentStore<T>(key: string): ComponentStore<T> {
    return this.componentStores.get(key) as ComponentStore<T>;
  }

  registerSystem<T extends System>(key: string, system: T, mode: 'normal' | 'fixed' | 'draw' = 'normal') {
    if (mode == 'normal') {
      this.systems.set(key, system);
    } else if (mode == 'fixed') {
      this.fixedSystems.set(key, system);
    } else if (mode == 'draw') {
      this.drawSystems.set(key, system);
    }
    system.init(this);
  }

  getSystem<T extends System>(key: string): T | false {
    if (this.systems.has(key)) {
      return this.systems.get(key) as T;
    } else if (this.fixedSystems.has(key)) {
      return this.fixedSystems.get(key) as T;
    } else if (this.drawSystems.has(key)) {
      return this.drawSystems.get(key) as T;
    } else {
      return false;
    }
  }

  getSystems(mode: 'normal' | 'fixed' | 'draw' = 'normal'): System[] {
    if (mode == 'normal') {
      return Array.from(this.systems.values());
    } else if (mode == 'fixed') {
      return Array.from(this.fixedSystems.values());
    } else if (mode == 'draw') {
      return Array.from(this.drawSystems.values());
    }
    return [];
  }
}
