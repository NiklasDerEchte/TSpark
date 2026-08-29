import * as twgljs from 'twgl.js';
import type { RenderLayer } from '../../core/types';
import type { Scene, World } from '../../core/world';
import { createProgramInfo, type RenderEnvironment } from '../../core/renderer/environment';
import { CellFlag } from './powder-grid';
import { MATERIALS, Material } from './materials';
import { PowderWorldComponent } from './powder-world';

export class PowderRenderLayer implements RenderLayer {
  private environment!: RenderEnvironment;
  private programInfo: twgljs.ProgramInfo | undefined;
  private bufferInfo: twgljs.BufferInfo | undefined;
  private texture: WebGLTexture | undefined;
  private pixels: Uint8Array | undefined;
  private textureWidth = 0;
  private textureHeight = 0;

  async init(environment: RenderEnvironment): Promise<void> {
    this.environment = environment;
    this.programInfo = await createProgramInfo(environment, 'shader/powder-vertex.glsl', 'shader/powder-fragment.glsl');

    const arrays: twgljs.Arrays = {
      position: {
        numComponents: 2,
        data: [-1, 1, 1, 1, 1, -1, -1, -1],
      },
      texCoord: {
        numComponents: 2,
        data: [0, 0, 1, 0, 1, 1, 0, 1],
      },
      indices: [0, 1, 2, 0, 2, 3],
    };
    this.bufferInfo = twgljs.createBufferInfoFromArrays(environment.gl, arrays);
  }

  draw(worlds: World[]): void {
    if (!this.environment || !this.programInfo || !this.bufferInfo) return;

    const gl = this.environment.gl;
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);

    worlds.forEach((world: World) => {
      world.getActiveScenes().forEach((scene: Scene) => {
        const store = scene.getComponentStore<PowderWorldComponent>(PowderWorldComponent.name);
        for (const [, powder] of store.entries()) {
          this.drawPowder(gl, powder);
        }
      });
    });
  }

  destroy(): void {
    if (this.texture && this.environment) {
      this.environment.gl.deleteTexture(this.texture);
    }
  }

  private drawPowder(gl: WebGLRenderingContext, powder: PowderWorldComponent): void {
    const grid = powder.grid;
    this.ensureTexture(gl, grid.width, grid.height);
    this.writePixels(powder);
    if (!this.texture || !this.pixels || !this.programInfo || !this.bufferInfo) return;

    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, grid.width, grid.height, gl.RGBA, gl.UNSIGNED_BYTE, this.pixels);

    const canvas = gl.canvas as HTMLCanvasElement;
    const viewW = canvas.width / powder.zoom;
    const viewH = canvas.height / powder.zoom;
    const originX = powder.cameraX - viewW * 0.5;
    const originY = powder.cameraY - viewH * 0.5;

    gl.useProgram(this.programInfo.program);
    twgljs.setBuffersAndAttributes(gl, this.programInfo, this.bufferInfo);
    twgljs.setUniforms(this.programInfo, {
      u_grid: this.texture,
      u_gridSize: [grid.width, grid.height],
      u_origin: [originX, originY],
      u_viewSize: [viewW, viewH],
      u_cursor: [powder.cursorX, powder.cursorY],
      u_brush: powder.brushRadius,
      u_voidColor: [0.027, 0.031, 0.047, 1],
      u_brushColor: [1, 1, 1, 0.9],
    });
    twgljs.drawBufferInfo(gl, this.bufferInfo);
  }

  private ensureTexture(gl: WebGLRenderingContext, width: number, height: number): void {
    if (this.texture && this.textureWidth === width && this.textureHeight === height) return;
    if (this.texture) gl.deleteTexture(this.texture);
    this.pixels = new Uint8Array(width * height * 4);
    this.texture = twgljs.createTexture(gl, {
      mag: gl.NEAREST,
      min: gl.NEAREST,
      wrap: gl.CLAMP_TO_EDGE,
      width,
      height,
      src: this.pixels,
    });
    this.textureWidth = width;
    this.textureHeight = height;
  }

  private writePixels(powder: PowderWorldComponent): void {
    const pixels = this.pixels;
    if (!pixels) return;
    const { cells, shade, flags, width, height } = powder.grid;
    const tick = powder.tick;
    const debug = powder.debugMatter;
    const n = width * height;
    for (let i = 0; i < n; i++) {
      const id = cells[i];
      const def = MATERIALS[id] ?? MATERIALS[Material.Empty];
      const o = i * 4;
      const dynamic = (flags[i] & CellFlag.Dynamic) !== 0;
      let flicker = 0;
      if (dynamic && id === Material.Lava) {
        flicker = ((tick + shade[i] + i) & 7) * 6;
      } else if (dynamic && id === Material.Water) {
        flicker = ((tick + shade[i]) & 3) * 4;
      }
      let s: number;
      if (id === Material.Empty) {
        s = 0;
      } else if (dynamic) {
        s = shade[i] - 10 + flicker + 16;
      } else {
        s = (shade[i] - 22) * 0.25 - 18;
      }
      let r = clampByte(def.color[0] + s);
      let g = clampByte(def.color[1] + s * 0.7);
      let b = clampByte(def.color[2] + s * 0.4);
      if (debug && id !== Material.Empty) {
        if (dynamic) {
          g = clampByte(g + 70);
          b = clampByte(b + 90);
        } else {
          r = clampByte(r * 0.55);
          g = clampByte(g * 0.55);
          b = clampByte(b * 0.55);
        }
      }
      pixels[o] = r;
      pixels[o + 1] = g;
      pixels[o + 2] = b;
      pixels[o + 3] = def.color[3];
    }
  }
}

function clampByte(value: number): number {
  if (value < 0) return 0;
  if (value > 255) return 255;
  return value | 0;
}
