import type { Scene } from '../../../core/world';
import type { Transform, RendererBackend, Camera, Sprite2D, Mesh3D } from '../../../types/index';

export class WebGPURenderer implements RendererBackend {
  private canvas!: HTMLCanvasElement;
  private context!: GPUCanvasContext;
  private device!: GPUDevice;
  private format!: GPUTextureFormat;
  private encoder?: GPUCommandEncoder;
  private pass?: GPURenderPassEncoder;

  async init(canvas: HTMLCanvasElement): Promise<void> {
    this.canvas = canvas;
    if (!('gpu' in navigator)) throw new Error('WebGPU not available');
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) throw new Error('No WebGPU adapter');
    this.device = await adapter.requestDevice();
    this.context = canvas.getContext('webgpu') as GPUCanvasContext;
    this.format = navigator.gpu.getPreferredCanvasFormat();
    this.context.configure({ device: this.device, format: this.format, alphaMode: 'opaque' });
  }

  resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  begin(camera: Camera): void {
    const bg = camera.background ?? '#000000';
    const r = parseInt(bg.slice(1, 3), 16) / 255;
    const g = parseInt(bg.slice(3, 5), 16) / 255;
    const b = parseInt(bg.slice(5, 7), 16) / 255;

    this.encoder = this.device.createCommandEncoder();
    const view = this.context.getCurrentTexture().createView();
    this.pass = this.encoder.beginRenderPass({
      colorAttachments: [
        {
          view,
          clearValue: { r, g, b, a: 1 },
          loadOp: 'clear',
          storeOp: 'store',
        },
      ],
    });
  }

  _drawSprite(_t: Transform, _s: Sprite2D): void {
    // Platzhalter: Pipeline + Quad später
  }

  _drawMesh(_t: Transform, _m: Mesh3D): void {
    // Platzhalter
  }

  draw(scene: Scene) {

  }

  end(): void {
    if (this.pass) this.pass.end();
    if (this.encoder) this.device.queue.submit([this.encoder.finish()]);
    this.pass = undefined;
    this.encoder = undefined;
  }
}
