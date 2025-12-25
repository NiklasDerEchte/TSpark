import { ComponentStore } from "../ecs/component-store";
import type { Transform, Velocity, Camera, Mesh3D, Sprite2D } from '../types/index';

export class SceneManager {
  // TODO Systeme müssen hier auch hinzugefügt werden können
  private componentStores: Map<string, ComponentStore<any>> = new Map();

  constructor() {
    this.registerComponent<Velocity>('velocities');
    this.registerComponent<Transform>('transforms');
    this.registerComponent<Sprite2D>('sprites2D');
    this.registerComponent<Mesh3D>('meshes3D');
    this.registerComponent<Camera>('cameras');
  }

  registerComponent<T>(key: string) {
    this.componentStores.set(key, new ComponentStore<T>());
  }

  getComponentStore<T>(key: string): ComponentStore<T> {
    return this.componentStores.get(key) as ComponentStore<T>;
  }
}