import type { System } from '../types/index';
import { World } from './world';

export class MovementSystem implements System {
  world: World;
  constructor(world: World) {
    this.world = world;
  }

  exec(dt: number) {
    for (const [entity, vel] of this.world.velocities.entries()) {
      const pos = this.world.positions.get(entity);
      if (!pos) continue;

      pos.x += vel.x * dt;
    }
  }
}
