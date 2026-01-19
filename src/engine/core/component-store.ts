import type { Entity } from "./types/index";

export class ComponentStore<T> {
  private data = new Map<Entity, T>();

  add(entity: Entity, component?: T) {
    try {
      if (component == undefined) {
        component = {} as T;
      }
      this.data.set(entity, component);
    } catch (error) {
      console.error(`Error adding component to entity ${entity}:`, error);
    }
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

  entries(): MapIterator<[Entity, T]> {
    return this.data.entries();
  }
}
