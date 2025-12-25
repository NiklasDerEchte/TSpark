import type { Transform, RendererBackend, Camera, Sprite2D, Mesh3D } from '../../../types/index';

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

  resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
    this.gl.viewport(0, 0, width, height);
  }

  begin(camera: Camera): void {
    const bg = camera.background ?? '#000000';
    const r = parseInt(bg.slice(1, 3), 16) / 255;
    const g = parseInt(bg.slice(3, 5), 16) / 255;
    const b = parseInt(bg.slice(5, 7), 16) / 255;
    this.gl.clearColor(r, g, b, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  }

  drawSprite(_t: Transform, _s: Sprite2D): void {
    // Platzhalter: Quad + Shader später
  }

  drawMesh(_t: Transform, _m: Mesh3D): void {
    // Platzhalter: Buffer + DrawCalls später
  }

  end(): void {}
}
