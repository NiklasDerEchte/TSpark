import type { System, Transform, Velocity } from '../../types/index';
import { Scene } from '../../core/world';

export class MovementSystem implements System {
  scene!: Scene;
  init(scene: Scene): void {
    this.scene = scene;
  }

  exec(dt: number) {
    for (const [entity, vel] of this.scene.getComponentStore<Velocity>('velocities').entries()) {
      const transform = this.scene.getComponentStore<Transform>('transforms').get(entity);
      if (!transform) continue;

      transform.position.x += vel.x * dt;
    }
  }
}
