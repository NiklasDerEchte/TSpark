import { World } from './world';

export class MovementSystem {
  world: World;
  constructor(world: World) {
    this.world = world;
  }

  update(dt: number) {
    for (const [entity, vel] of this.world.velocities.entries()) {
      const pos = this.world.positions.get(entity);
      if (!pos) continue;

      pos.x += vel.x * dt;
    }
  }
}
