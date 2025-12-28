import { TSpark } from '../../../app';
import { Scene } from '../../core/world';
import type { System, Transform, RendererBackend, Camera, Sprite2D, Mesh3D } from '../../types/index';

export class RenderSystem implements System {
  backend: RendererBackend;
  scene!: Scene;
  constructor() {
    console.log("RenderSystem initialized");
    this.backend = TSpark.Instance.getRenderer();
  }

  init(scene: Scene): void {
    this.scene = scene;
  }

  exec(dt: number): void {
    let camera: Camera | undefined;
    for (const [, cam] of this.scene.getComponentStore<Camera>("cameras").entries()) {
      camera = cam;
      break;
    }
    camera ??= { mode: '2d', background: '#202020' };

    this.backend.begin(camera);

    for (const [entity, sprite] of this.scene.getComponentStore<Sprite2D>('sprites2D').entries()) {
      const t = this.scene.getComponentStore<Transform>('transforms').get(entity);
      if (!t) continue;
      this.backend.drawSprite(t, sprite);
    }

    for (const [entity, mesh] of this.scene.getComponentStore<Mesh3D>('meshes3D').entries()) {
      const t = this.scene.getComponentStore<Transform>('transforms').get(entity);
      if (!t) continue;
      this.backend.drawMesh(t, mesh);
    }

    this.backend.end();
  }
}
