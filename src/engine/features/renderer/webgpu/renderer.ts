import type { Scene } from '../../../core/world';
import { type Transform3D, type RendererBackend, type Camera, type Sprite2D, type Mesh3D, type Dimension, getDefaultCamera } from '../../../types/index';

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

  resize(size: Dimension): void {
    this.canvas.width = size.width;
    this.canvas.height = size.height;
  }

  _drawSprite(_t: Transform3D, _s: Sprite2D): void {
    // Platzhalter: Pipeline + Quad später
  }

  _drawMesh(_t: Transform3D, _m: Mesh3D): void {
    // Platzhalter
  }

  draw(scene: Scene) {
    let camera = getDefaultCamera(scene);
    const bg = camera?.background ?? '#000';
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

    if (this.pass) this.pass.end();
    if (this.encoder) this.device.queue.submit([this.encoder.finish()]);
    this.pass = undefined;
    this.encoder = undefined;
  }

  destroy(): void {}
}
