import type { World } from '../../../core/world';
import { type RendererBackend, type Dimension, component2D, component3D, type RenderLayer } from '../../types/index';

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

  draw(worlds: World[]) {
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

  
    /**
     * Add a render layer to the renderer
     * @param key 
     * @param renderLayer 
     */
    async addRenderLayer(key: string, renderLayer: RenderLayer): Promise<void> {
      return;
    }
  
    /**
     * Get a render layer by key
     * @param key 
     */
    getRenderLayer(key: string): RenderLayer | undefined {
      return undefined;
    }
  
    /**
     * Remove a render layer by key
     * @param key 
     */
    removeRenderLayer(key: string): void {}

  // private drawSprite(t: component3D.Transform, s: component2D.Sprite): void {
  //   this.ctx.fillStyle = s.color;
  //   this.ctx.fillRect(t.position.x, t.position.y, s.width, s.height);
  // }

  destroy(): void {}
}
