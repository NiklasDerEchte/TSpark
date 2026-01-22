import * as twgljs from 'twgl.js';
import { World, type Dimension, type RendererBackend, type RenderLayer } from '../../../index';
import { setupEnvironment, type RenderEnvironment } from '../environment';

export interface TwglRenderSettings {
  clearColor: { r: number; g: number; b: number; a: number };
  enableDepthTest: boolean;
  enableCullFace: boolean;
}

export class TwglRenderer implements RendererBackend {
  private setup: TwglRenderSettings;

  private environment!: RenderEnvironment;
  private renderLayers: Map<string, RenderLayer> = new Map<string, RenderLayer>();

  constructor(setup?: Partial<TwglRenderSettings>) {
    this.setup = {
      enableCullFace: setup?.enableCullFace ?? false,
      enableDepthTest: setup?.enableDepthTest ?? true,
      clearColor: setup?.clearColor ?? { r: 0.97, g: 0.97, b: 0.97, a: 1 },
    };
  }

  async init(canvas: HTMLCanvasElement): Promise<void> {
    const gl = canvas.getContext('webgl');
    if (!gl) {
      throw new Error('[twgl] WebGL is not supported');
    }
    this.environment = await setupEnvironment(gl);
    this.renderLayers.forEach(async (renderLayer: RenderLayer) => {
      await renderLayer.init(this.environment);
    });
    console.log('[twgl] WebGL device initialized');
  }

  resize(size: Dimension): void {
    if (!this.environment?.gl) return;
    this.environment.gl.canvas.width = size.width;
    this.environment.gl.canvas.height = size.height;
    this.environment.gl.viewport(0, 0, this.environment.gl.canvas.width, this.environment.gl.canvas.height);
  }

  async addRenderLayer(key: string, renderLayer: RenderLayer): Promise<void> {
    if(this.environment) {
      await renderLayer.init(this.environment);
    }
    this.renderLayers.set(key, renderLayer);
  }

  getRenderLayer(key: string): RenderLayer | undefined {
    return this.renderLayers.get(key);
  }

  removeRenderLayer(key: string): void {
    if (this.renderLayers.has(key)) {
      this.renderLayers.delete(key);
    }
  }

  /**
   * this function is called every frame to draw the worlds
   * @param worlds
   * @returns
   */
  draw(worlds: World[]): void {
    if (!this.environment?.gl) return;
    twgljs.resizeCanvasToDisplaySize(this.environment.gl.canvas as HTMLCanvasElement);
    this.environment.gl.viewport(0, 0, this.environment.gl.canvas.width, this.environment.gl.canvas.height);
    this.environment.gl.clearColor(this.setup.clearColor.r, this.setup.clearColor.g, this.setup.clearColor.b, this.setup.clearColor.a);
    this.environment.gl.clear(this.environment.gl.COLOR_BUFFER_BIT | this.environment.gl.DEPTH_BUFFER_BIT);
    if (this.setup.enableDepthTest) {
      this.environment.gl.enable(this.environment.gl.DEPTH_TEST);
    }
    if (this.setup.enableCullFace) {
      this.environment.gl.enable(this.environment.gl.CULL_FACE);
    }
    this.renderLayers.forEach((renderLayer: RenderLayer) => {
      renderLayer.draw(worlds);
    });
  }

  destroy(): void {
    // twgl hat keine explizite destroy-Methode, der GC sollte das übernehmen.
    // WebGL-Kontextverlust kann hier behandelt werden, falls nötig.
    this.renderLayers.forEach(async (renderLayer: RenderLayer) => {
      await renderLayer.destroy();
    });
  }
}
