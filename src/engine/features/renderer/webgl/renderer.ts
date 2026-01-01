import type { Scene } from '../../../core/world';
import { type Transform3D, type RendererBackend, type Camera, type Sprite2D, type Mesh3D, type Dimension, getDefaultCamera } from '../../../types/index';

export class WebGLRenderer implements RendererBackend {
  private canvas!: HTMLCanvasElement;
  private gl!: WebGLRenderingContext;

  async init(canvas: HTMLCanvasElement): Promise<void> {
    this.canvas = canvas;
    const gl = canvas.getContext('webgl');
    if (!gl) throw new Error('WebGL not available');
    this.gl = gl;
    this.gl.enable(this.gl.DEPTH_TEST);
  }

  resize(size: Dimension): void {
    this.canvas.width = size.width;
    this.canvas.height = size.height;
    this.gl.viewport(0, 0, size.width, size.height);
  }


  draw(scene: Scene) {
    let camera = getDefaultCamera(scene);
    const bg = camera?.background ?? '#000';
    const r = parseInt(bg.slice(1, 3), 16) / 255;
    const g = parseInt(bg.slice(3, 5), 16) / 255;
    const b = parseInt(bg.slice(5, 7), 16) / 255;
    this.gl.clearColor(r, g, b, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  }

  _drawSprite(_t: Transform3D, _s: Sprite2D): void {
    // Platzhalter: Quad + Shader später
  }

  _drawMesh(_t: Transform3D, _m: Mesh3D): void {
    // Platzhalter: Buffer + DrawCalls später
  }

  destroy(): void {}
}
