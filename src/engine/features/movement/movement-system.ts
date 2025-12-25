import type { System, Transform, Velocity } from '../../types/index';
import { World } from '../../core/world';

export class MovementSystem implements System {
  world: World;
  constructor(world: World) {
    this.world = world;
  }

  exec(dt: number) {
    for (const [entity, vel] of this.world.sceneManager.getComponentStore<Velocity>('velocities').entries()) {
      const transform = this.world.sceneManager.getComponentStore<Transform>('transforms').get(entity);
      if (!transform) continue;

      transform.position.x += vel.x * dt;
    }
  }
}
