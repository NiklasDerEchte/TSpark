import type { Scene } from '../../../core/world';
import { type RendererBackend, type Dimension, getDefaultCamera, component2D, component3D } from '../../types/index';

export class Canvas2DRenderer implements RendererBackend {
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;

  async init(canvas: HTMLCanvasElement): Promise<void> {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas2D not available');
    this.ctx = ctx;
  }

  resize(size: Dimension): void {
    this.canvas.width = size.width;
    this.canvas.height = size.height;
  }

  draw(scenes: Scene[]) {
    // let camera = getDefaultCamera(scene);
    // const bg = camera?.background ?? '#000';
    // this.ctx.fillStyle = bg;
    // this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // scenes.forEach((scene: Scene) => {
    //   for (const [entity, sprite] of scene.getComponentStore<component2D.Sprite>('sprite2d').entries()) {
    //     const t = scene.getComponentStore<component3D.Transform>('transform2d').get(entity);
    //     if (!t) continue;
    //     this.drawSprite(t, sprite);
    //   }
    // });
  }

  // private drawSprite(t: component3D.Transform, s: component2D.Sprite): void {
  //   this.ctx.fillStyle = s.color;
  //   this.ctx.fillRect(t.position.x, t.position.y, s.width, s.height);
  // }

  destroy(): void {}
}
