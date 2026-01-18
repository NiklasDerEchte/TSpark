import * as twgljs from 'twgl.js';
import { component2D, component3D, type Dimension, type Entity, type RendererBackend } from '../../../index';
import { Scene } from '../../world';
import { Sub3DRenderer } from './3d/sub-renderer';
import { setupEnvironment, type TwglRenderEnvironment } from './environment';
import { SdfSub2DRenderer } from './2d/sdf-sub-renderer';

export interface TwglRenderSettings {
  clearColor: { r: number; g: number; b: number; a: number };
  enableDepthTest: boolean;
  enableCullFace: boolean;
}

export class TwglRenderer implements RendererBackend {
  private setup: TwglRenderSettings;
  private gl!: WebGLRenderingContext;

  private environment!: TwglRenderEnvironment;
  private sub3DRenderer!: Sub3DRenderer;
  private sdfSub2DRenderer!: SdfSub2DRenderer;

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
    this.gl = gl;

    this.environment = await setupEnvironment(gl);
    this.sub3DRenderer = new Sub3DRenderer(gl, this.environment);
    this.sdfSub2DRenderer = new SdfSub2DRenderer(gl, this.environment);

    // TODO NEXT Irgendwie wird immer noch kein text gerendert wenn ich sdf verwende
    await this.sdfSub2DRenderer.loadFont('fonts/arial/arial.fnt', 'fonts/arial/arial.png');

    console.log('[twgl] WebGL device initialized');
  }

  resize(size: Dimension): void {
    if (!this.gl) return;
    this.gl.canvas.width = size.width;
    this.gl.canvas.height = size.height;
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
  }

  /**
   * this function is called every frame to draw the scenes
   * @param scenes
   * @returns
   */
  draw(scenes: Scene[]): void {
    if (!this.gl) return;

    twgljs.resizeCanvasToDisplaySize(this.gl.canvas as HTMLCanvasElement);
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clearColor(this.setup.clearColor.r, this.setup.clearColor.g, this.setup.clearColor.b, this.setup.clearColor.a);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    if (this.setup.enableDepthTest) {
      this.gl.enable(this.gl.DEPTH_TEST);
    }
    if (this.setup.enableCullFace) {
      this.gl.enable(this.gl.CULL_FACE);
    }

    this.sub3DRenderer.draw(scenes);
    this.gl.clear(this.gl.DEPTH_BUFFER_BIT);
    this.sdfSub2DRenderer.draw(scenes);
    if (this.setup.enableDepthTest) {
      this.gl.enable(this.gl.DEPTH_TEST);
    }
  }

  destroy(): void {
    // twgl hat keine explizite destroy-Methode, der GC sollte das übernehmen.
    // WebGL-Kontextverlust kann hier behandelt werden, falls nötig.
  }
}
