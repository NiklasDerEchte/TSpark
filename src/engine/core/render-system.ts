import { World } from './world';
import type { RendererBackend, Camera } from '../renderer/backend';
import type { System } from '../types/index';

export class RenderSystem implements System {
  world: World;
  backend: RendererBackend;
  constructor(world: World, backend: RendererBackend) {
    this.world = world;
    this.backend = backend;
  }

  exec(dt: number): void {
    let camera: Camera | undefined;
    for (const [, cam] of this.world.cameras.entries()) {
      camera = cam;
      break;
    }
    camera ??= { mode: '2d', background: '#202020' };

    this.backend.begin(camera);

    for (const [entity, sprite] of this.world.sprites2D.entries()) {
      const t = this.world.transforms.get(entity);
      if (!t) continue;
      this.backend.drawSprite(t, sprite);
    }

    for (const [entity, mesh] of this.world.meshes3D.entries()) {
      const t = this.world.transforms.get(entity);
      if (!t) continue;
      this.backend.drawMesh(t, mesh);
    }

    this.backend.end();
  }
}
