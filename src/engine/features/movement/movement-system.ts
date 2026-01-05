import type { component2D, System } from '../../core/types/index';
import { Scene } from '../../core/world';

export class MovementSystem implements System {
  scene!: Scene;
  init(scene: Scene): void {
    this.scene = scene;
  }

  exec(dt: number) {
    for (const [entity, vel] of this.scene.getComponentStore<component2D.Velocity>('velocity2d').entries()) {
      const transform = this.scene.getComponentStore<component2D.Transform>('transform2d').get(entity);
      if (!transform) continue;

      transform.position.x += vel.x * dt;
    }
  }

  destroy(): void {
    
  }
}
