import { TSpark } from '../../../app';
import { Scene } from '../../core/world';
import type { System, RendererBackend, Camera} from '../../types/index';

export class RenderSystem implements System {
  renderer: RendererBackend;
  scene!: Scene;
  constructor() {
    console.log('RenderSystem initialized');
    this.renderer = TSpark.Instance.getRenderer();
  }

  init(scene: Scene): void {
    this.scene = scene;
  }

  exec(_dt: number): void {
    let camera: Camera | undefined;
    for (const [, cam] of this.scene.getComponentStore<Camera>('cameras').entries()) {
      camera = cam;
      break;
    }
    camera ??= { id: 'cam', mode: '2d', background: '#dbdbdbff' };

    this.renderer.begin(camera);
    this.renderer.draw(this.scene);
    this.renderer.end();
  }
}
