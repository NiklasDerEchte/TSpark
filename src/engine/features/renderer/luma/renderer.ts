import type { Transform3D, RendererBackend, Camera, Mesh3D } from '../../../types/index';
import { webgl2Adapter } from '@luma.gl/webgl';
import { luma } from '@luma.gl/core';
import { Model } from '@luma.gl/engine';
import type { Scene } from '../../../core/world';
import { colord } from 'colord';

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
    const rgba = colord(camera.background ?? '#000000').toRgb();
    const gl = (this.device as any).gl as WebGLRenderingContext | WebGL2RenderingContext;
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Create a render pass targeting the default framebuffer
    this.renderPass = this.device.beginRenderPass({ clearColor: [rgba.r / 255, rgba.g / 255, rgba.b / 255, rgba.a] });
  }

  draw(scene: Scene): void {
    for (const [entity, mesh] of scene.getComponentStore<Mesh3D>('meshes3D').entries()) {
      const t = scene.getComponentStore<Transform3D>('transforms').get(entity);
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

  private drawMesh(_t: Transform3D, _m: Mesh3D): void {
    // 3D not implemented in this minimal example
  }
}
