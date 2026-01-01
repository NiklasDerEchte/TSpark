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
    this.renderer.draw(this.scene);
  }
}
