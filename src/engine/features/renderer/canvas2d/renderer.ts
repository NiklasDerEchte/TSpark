import type { Scene } from '../../../core/world';
import type { Transform, RendererBackend, Camera, Sprite2D } from '../../../types/index';

export class Canvas2DRenderer implements RendererBackend {
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;

  async init(canvas: HTMLCanvasElement): Promise<void> {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas2D not available');
    this.ctx = ctx;
  }

  resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  begin(camera: Camera): void {
    const bg = camera.background ?? '#000';
    this.ctx.fillStyle = bg;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  draw(scene: Scene) {
    for (const [entity, sprite] of scene.getComponentStore<Sprite2D>('sprites2D').entries()) {
      const t = scene.getComponentStore<Transform>('transforms').get(entity);
      if (!t) continue;
      this.drawSprite(t, sprite);
    }
  }

  end(): void {}

  private drawSprite(t: Transform, s: Sprite2D): void {
    this.ctx.fillStyle = s.color;
    this.ctx.fillRect(t.position.x, t.position.y, s.width, s.height);
  }
}
