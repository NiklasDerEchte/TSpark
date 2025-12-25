import { World } from '../../core/world';
import type { System, Transform, RendererBackend, Camera, Sprite2D, Mesh3D } from '../../types/index';

export class RenderSystem implements System {
  world: World;
  backend: RendererBackend;
  constructor(world: World, backend: RendererBackend) {
    this.world = world;
    this.backend = backend;
  }

  exec(dt: number): void {
    let camera: Camera | undefined;
    for (const [, cam] of this.world.sceneManager.getComponentStore<Camera>("cameras").entries()) {
      camera = cam;
      break;
    }
    camera ??= { mode: '2d', background: '#202020' };

    this.backend.begin(camera);

    for (const [entity, sprite] of this.world.sceneManager.getComponentStore<Sprite2D>('sprites2D').entries()) {
      const t = this.world.sceneManager.getComponentStore<Transform>('transforms').get(entity);
      if (!t) continue;
      this.backend.drawSprite(t, sprite);
    }

    for (const [entity, mesh] of this.world.sceneManager.getComponentStore<Mesh3D>('meshes3D').entries()) {
      const t = this.world.sceneManager.getComponentStore<Transform>('transforms').get(entity);
      if (!t) continue;
      this.backend.drawMesh(t, mesh);
    }

    this.backend.end();
  }
}
