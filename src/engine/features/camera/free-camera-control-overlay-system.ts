import { TSpark } from '../../../app';
import type { System, World } from '../../../engine';

export class FreeCameraControlOverlaySystem implements System {
  world!: World;
  init(world: World): void {
    this.world = world;
    TSpark.getInstance()
      .inject({
        html: ['ui/free-camera-control-overlay/overlay.html'],
        css: ['ui/free-camera-control-overlay/overlay.css'],
      })
      .then(() => {});
  }

  exec(dt: number) {}

  destroy(): void {}
}
