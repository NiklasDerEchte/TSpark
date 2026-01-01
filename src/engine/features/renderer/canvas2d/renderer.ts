import type { Scene } from '../../../core/world';
import { type Transform3D, type RendererBackend, type Camera, type Sprite2D, type Dimension, getDefaultCamera } from '../../../types/index';

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

  draw(scene: Scene) {
    let camera = getDefaultCamera(scene);
    const bg = camera?.background ?? '#000';
    this.ctx.fillStyle = bg;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    for (const [entity, sprite] of scene.getComponentStore<Sprite2D>('sprites2D').entries()) {
      const t = scene.getComponentStore<Transform3D>('transforms').get(entity);
      if (!t) continue;
      this.drawSprite(t, sprite);
    }
  }

  private drawSprite(t: Transform3D, s: Sprite2D): void {
    this.ctx.fillStyle = s.color;
    this.ctx.fillRect(t.position.x, t.position.y, s.width, s.height);
  }

  destroy(): void {
    
  }
}
