import { TSpark } from '../../../app';
import { Scene } from '../../core/world';
import type { System, RendererBackend} from '../../types/index';

export class RenderSystem implements System {
  renderer: RendererBackend;
  scene!: Scene;
  constructor() {
    this.renderer = TSpark.Instance.getRenderer();
    console.log('RenderSystem initialized');
  }

  init(scene: Scene): void {
    this.scene = scene;
  }

  exec(_dt: number): void {
    this.renderer.draw(this.scene);
  }

  destroy(): void {}
}
