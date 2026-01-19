import { TSpark } from '../../app';
import type { System } from '../../engine/core/types/index';
import { Scene } from '../../engine/core/world';

export class KeyboardControlSystem implements System {
  scene!: Scene;

  init(scene: Scene): void {
    this.scene = scene;
  }

  exec(dt: number) {
    if (TSpark.Instance.isKeyPressed('KeyW') || TSpark.Instance.isKeyPressed('ArrowUp')) {
      console.log('Vorwärts bewegen');
    }
    if (TSpark.Instance.isKeyPressed('KeyA') || TSpark.Instance.isKeyPressed('ArrowLeft')) {
      console.log('Links bewegen');
    }
    if (TSpark.Instance.isKeyPressed('KeyS') || TSpark.Instance.isKeyPressed('ArrowDown')) {
      console.log('Rückwärts bewegen');
    }
    if (TSpark.Instance.isKeyPressed('KeyD') || TSpark.Instance.isKeyPressed('ArrowRight')) {
      console.log('Rechts bewegen');
    }
  }

  destroy(): void {}
}
