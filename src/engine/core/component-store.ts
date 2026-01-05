import type { Entity } from "./types/index";

export class ComponentStore<T> {
  private data = new Map<Entity, T>();

  add(entity: Entity, component: T) {
    this.data.set(entity, component);
  }

  get(entity: Entity): T | undefined {
    return this.data.get(entity);
  }

  has(entity: Entity): boolean {
    return this.data.has(entity);
  }

  remove(entity: Entity): boolean {
    return this.data.delete(entity);
  }

  entries() {
    return this.data.entries();
  }
}
