import type { component2D, System } from '../../core/types/index';
import { Scene, World } from '../../core/world';

export class MovementSystem implements System {
  world!: World;
  init(world: World): void {
    this.world = world;
  }

  exec(dt: number) {
    // for (const [entity, vel] of this.scene.getComponentStore<component2D.Velocity>('velocity2d').entries()) {
    //   const transform = this.scene.getComponentStore<component2D.Transform>('transform2d').get(entity);
    //   if (!transform) continue;
    //   transform.position.x += vel.x * dt;
    // }
  }

  destroy(): void {}
}
