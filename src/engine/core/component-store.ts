import type { Entity } from "./types/index";

export class ComponentStore<T> {
  private data = new Map<Entity, T>();

  /**
   * Adds a component to an entity
   * @param entity 
   * @param component 
   */
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

  /**
   * Gets a component of an entity
   * @param entity the entity to get the component for
   * @returns {T | undefined} the component or undefined if not found
   */
  get(entity: Entity): T | undefined {
    return this.data.get(entity);
  }

  /**
   * Checks if the component store has a component for the given entity
   * @param entity 
   * @returns {boolean}
   */
  has(entity: Entity): boolean {
    return this.data.has(entity);
  }

  /**
   * Removes a component from an entity
   * @param entity 
   * @returns 
   */
  remove(entity: Entity): boolean {
    return this.data.delete(entity);
  }

  /**
   * Gets all entries in the component store
   * @returns 
   */
  entries(): MapIterator<[Entity, T]> {
    return this.data.entries();
  }
}
