import { TSpark } from '../../../../app';
import type { System, World } from '../../../../engine';

export class FPSOverlaySystem implements System {
  private fpsNode: Text | undefined;
  world!: World;
  init(world: World): void {
    this.world = world;
    TSpark.getInstance()
      .inject({
        html: ['ui/fps-overlay/overlay.html'],
        css: ['ui/fps-overlay/overlay.css'],
      })
      .then(() => {
        let fpsElement = document.querySelector('#fps');
        this.fpsNode = document.createTextNode('');
        fpsElement?.appendChild(this.fpsNode);
      });
  }

  exec(dt: number) {
    if (this.fpsNode) {
      this.fpsNode.nodeValue = TSpark.getInstance().getFPS().toFixed(0);
    }
  }

  destroy(): void {}
}
