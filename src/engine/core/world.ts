import { generateUniqueId } from '..';
import type { Component, Entity, SceneDefaultComponents, SceneDefaultSystems, System } from './types/index';
import { ComponentStore } from './component-store';
import { defaultComponents } from './scene-defaults/components';
import { defaultSystems } from './scene-defaults/systems';

export class World {
  private scenes: Map<string, Scene> = new Map<string, Scene>();
  private activeSceneIndexes: string[] = [];
  constructor() {}

  createScene(name: string): Scene {
    if (this.scenes.size == 0 && this.activeSceneIndexes.length == 0) {
      this.activeSceneIndexes.push(name);
    }
    let scene = new Scene(name);
    this.scenes.set(name, scene);
    return scene;
  }

  removeScene(name: string): boolean {
    if (this.activeSceneIndexes.includes(name)) {
      this.activeSceneIndexes = this.activeSceneIndexes.filter((n) => n !== name);
    }
    if (this.scenes.has(name)){
      let scene = this.scenes.get(name);
      if(scene) {
        scene.getSystems('normal').forEach((system: System) => {
          system.destroy();
        });
        scene.getSystems('fixed').forEach((system: System) => {
          system.destroy();
        });
      }
      return this.scenes.delete(name);
    }
    return false;
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
  private name: string;
  private entities: Entity[] = [];
  private systems: Map<string, System> = new Map();
  private fixedSystems: Map<string, System> = new Map();
  private componentStores: Map<string, ComponentStore<Component<any>>> = new Map();

  private activeCameraEntity: Entity | undefined = undefined;

  constructor(name: string) {
    this.name = name;
    // init defaults
    this.initComponents();
    this.initSystems();
  }

  private initComponents() {
    for (const entry of defaultComponents as Array<SceneDefaultComponents>) {
      const instance = new entry.component();
      this.registerComponent({
        key: entry.key,
        component: instance,
      });
    }
  }

  private initSystems() {
    for (const entry of defaultSystems as Array<SceneDefaultSystems>) {
      const instance = new entry.system();
      const mode = entry.options?.mode ?? 'normal';
      this.registerSystem({
        key: entry.key,
        system: instance,
        mode: mode,
      });
    }
  }

  public setActiveCameraEntity(camera: Entity): void {
    if (this.entities.includes(camera)) {
      this.activeCameraEntity = camera;
    } else {
      throw new Error('Camera entity does not exist in the scene');
    }
  }

  public getActiveCameraEntity(): Entity | undefined {
    return this.activeCameraEntity;
  }

  public createEntity(): Entity {
    let entity = '';
    do {
      entity = generateUniqueId();
    } while (this.entities.includes(entity));
    this.entities.push(entity);
    return entity;
  }

  public getName(): string {
    return this.name;
  }

  registerComponent<T extends Component<any>>({ key = undefined, component }: { key?: string | undefined; component: T }): string {
    if (component == null) {
      throw new Error('Component is null or undefined');
    }
    if (!(typeof component === 'object' && component.constructor)) {
      throw new Error('Component must be a class instance');
    }
    if (key == undefined) {
      key = component.constructor.name;
    }
    if (this.componentStores.has(key)) {
      throw new Error(`ComponentStore with key "${key}" is already registered`);
    }
    this.componentStores.set(key, new ComponentStore<T>());
    return key;
  }

  getComponentStore<T extends Component<any>>(key: string): ComponentStore<T> {
    return this.componentStores.get(key) as ComponentStore<T>;
  }

  registerSystem<T extends System>({ key = undefined, system, mode = 'normal' }: { key?: string | undefined; system: T; mode: 'normal' | 'fixed' }) {
    if (system == null) {
      throw new Error('System is null or undefined');
    }
    if (!(typeof system === 'object' && system.constructor)) {
      throw new Error('System must be a class instance');
    }
    if (key == undefined) {
      key = system.constructor.name;
    }
    if (mode == 'normal') {
      if (this.systems.has(key)) {
        throw new Error(`System with key "${key}" is already registered`);
      }
      this.systems.set(key, system);
    } else if (mode == 'fixed') {
      if (this.fixedSystems.has(key)) {
        throw new Error(`FixedSystem with key "${key}" is already registered`);
      }
      this.fixedSystems.set(key, system);
    }
    system.init(this);
  }

  removeSystem(key: string): boolean {
    let system: System;
    if (this.systems.has(key)) {
      system = this.systems.get(key) as System;
      system.destroy();
      return this.systems.delete(key);
    } else if (this.fixedSystems.has(key)) {
      system = this.fixedSystems.get(key) as System;
      system.destroy();
      return this.fixedSystems.delete(key);
    } else {
      return false;
    }
  }

  getSystem<T extends System>(key: string): T | false {
    if (this.systems.has(key)) {
      return this.systems.get(key) as T;
    } else if (this.fixedSystems.has(key)) {
      return this.fixedSystems.get(key) as T;
    } else {
      return false;
    }
  }

  getSystems(mode: 'normal' | 'fixed' = 'normal'): System[] {
    if (mode == 'normal') {
      return Array.from(this.systems.values());
    } else if (mode == 'fixed') {
      return Array.from(this.fixedSystems.values());
    }
    return [];
  }
}
