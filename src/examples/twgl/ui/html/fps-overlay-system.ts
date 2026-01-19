import { TSpark } from '../../../../app';
import type { Scene, System } from '../../../../engine';

export class FPSOverlaySystem implements System {
  private fpsNode: Text | undefined;
  scene!: Scene;
  init(scene: Scene): void {
    this.scene = scene;
    TSpark.Instance.inject({
      html: ['ui/fps-overlay/overlay.html'],
      css: ['ui/fps-overlay/overlay.css'],
    }).then(() => {
      let fpsElement = document.querySelector('#fps');
      this.fpsNode = document.createTextNode('');
      fpsElement?.appendChild(this.fpsNode);
    });
  }

  exec(dt: number) {
    if (this.fpsNode) {
      this.fpsNode.nodeValue = TSpark.Instance.getFPS().toFixed(0);
    }
  }

  destroy(): void {}
}
