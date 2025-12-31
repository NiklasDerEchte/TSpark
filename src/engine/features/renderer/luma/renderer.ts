import type { Transform, RendererBackend, Camera, Sprite2D, Mesh3D } from '../../../types/index';
import { webgl2Adapter } from '@luma.gl/webgl';
import { luma } from '@luma.gl/core';
import { Model } from '@luma.gl/engine';
import type { Scene } from '../../../core/world';

function hexToRgba(hex: string): [number, number, number, number] {
  const h = hex.replace('#', '');
  const bigint = parseInt(
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h,
    16
  );
  const r = ((bigint >> 16) & 255) / 255;
  const g = ((bigint >> 8) & 255) / 255;
  const b = (bigint & 255) / 255;
  return [r, g, b, 1];
}

export class LumaRenderer implements RendererBackend {
  private canvas!: HTMLCanvasElement;
  // Keep device typed as any to be resilient across minor API changes
  private device!: any;
  private model!: Model;
  private positionBuffer!: any; // Keep types lax to avoid API drift issues
  private renderPass: any | null = null;

  async init(canvas: HTMLCanvasElement): Promise<void> {
    this.canvas = canvas;

    // Attach a luma Device to an existing WebGL2 context (idiomatic v9)
    const gl = canvas.getContext('webgl2', { antialias: true, depth: true }) as WebGL2RenderingContext | null;
    if (!gl) throw new Error('WebGL2 not available');
    this.device = await luma.attachDevice(gl, {
      adapters: [webgl2Adapter],
      createCanvasContext: { autoResize: false },
    });

    // Create a dynamic position buffer (we will update per sprite in clip-space)
    const positions = new Float32Array(12);
    this.positionBuffer = this.device.createBuffer(positions);

    this.model = new Model(this.device, {
      vs: `#version 300 es
        in vec2 aPosition;
        in vec4 aColor;
        out vec4 vColor;
        void main() {
          vColor = aColor;
          gl_Position = vec4(aPosition, 0.0, 1.0);
        }
      `,
      fs: `#version 300 es
        precision highp float;
        in vec4 vColor;
        out vec4 fragColor;
        void main() {
          fragColor = vColor;
        }
      `,
      attributes: {
        aPosition: this.positionBuffer,
      },
      vertexCount: 6,
      topology: 'triangle-list',
    });
  }

  resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  begin(camera: Camera): void {
    const [r, g, b, a] = hexToRgba(camera.background ?? '#000000');
    const gl = (this.device as any).gl as WebGLRenderingContext | WebGL2RenderingContext;
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(r, g, b, a);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Create a render pass targeting the default framebuffer
    this.renderPass = this.device.beginRenderPass({});
  }

  draw(scene: Scene): void {
    for (const [entity, sprite] of scene.getComponentStore<Sprite2D>('sprites2D').entries()) {
      const t = scene.getComponentStore<Transform>('transforms').get(entity);
      if (!t) continue;
      this.drawSprite(t, sprite);
    }
    for (const [entity, mesh] of scene.getComponentStore<Mesh3D>('meshes3D').entries()) {
      const t = scene.getComponentStore<Transform>('transforms').get(entity);
      if (!t) continue;
      this.drawMesh(t, mesh);
    }
  }

  end(): void {
    if (this.renderPass) {
      this.renderPass.end();
      this.renderPass = null;
    }
    if (this.device) {
      this.device.submit?.();
    }
  }

  private drawSprite(t: Transform, s: Sprite2D): void {
    // Compute rectangle in pixel space and convert to clip space on CPU
    const cx = t.position.x;
    const cy = t.position.y;
    const w = s.width;
    const h = s.height;

    const cw = this.canvas.width;
    const ch = this.canvas.height;

    // Pixel corners (two triangles)
    const x0 = cx;
    const y0 = cy;
    const x1 = cx + w;
    const y1 = cy + h;

    // Convert to clip space (-1..1) with Y flipped
    const toClipX = (x: number) => (x / cw) * 2 - 1;
    const toClipY = (y: number) => -((y / ch) * 2 - 1);

    const positions = new Float32Array([
      toClipX(x0),
      toClipY(y0),
      toClipX(x1),
      toClipY(y0),
      toClipX(x0),
      toClipY(y1),
      toClipX(x0),
      toClipY(y1),
      toClipX(x1),
      toClipY(y0),
      toClipX(x1),
      toClipY(y1),
    ]);
    this.positionBuffer.write(positions);

    // Set a constant attribute for color (WebGL-only convenience)
    const color = hexToRgba(s.color);
    this.model.setConstantAttributes({ aColor: new Float32Array(color) });

    this.model.draw(this.renderPass);
  }

  private drawMesh(_t: Transform, _m: Mesh3D): void {
    // 3D not implemented in this minimal example
  }
}
