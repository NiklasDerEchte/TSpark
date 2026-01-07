import * as twgljs from 'twgl.js';
import { component3D, type Dimension, type Entity, type RendererBackend } from '../../types/index';
import type { Scene } from '../../world';

const XYZ = 3;
const UV = 2;

const shader = {
  baseColor: {
    vs: `
  attribute vec4 position;
  
  uniform mat4 u_worldViewProjection;

  void main() {
    gl_Position = u_worldViewProjection * position;
  }
`,
    fs: `
  precision mediump float;

  uniform vec4 u_color;

  void main() {
    gl_FragColor = u_color;
  }
`,
  },
  texture: {
    vs: `
  attribute vec4 position;
  attribute vec2 texCoord;

  uniform mat4 u_worldViewProjection;

  varying vec2 v_texCoord;

  void main() {
    gl_Position = u_worldViewProjection * position;
    v_texCoord = texCoord;
  }
`,
    fs: `
  precision mediump float;

  uniform sampler2D u_texture;
  varying vec2 v_texCoord;

  void main() {
    gl_FragColor = texture2D(u_texture, v_texCoord);
  }
`,
  },
};

interface RenderCache {
  buffer: twgljs.BufferInfo;
  texture: WebGLTexture;
}

export class TwglRenderer implements RendererBackend {
  private gl!: WebGLRenderingContext;
  private programInfo!: twgljs.ProgramInfo;
  private renderCache: Map<Entity, RenderCache> = new Map<Entity, RenderCache>();

  async init(canvas: HTMLCanvasElement): Promise<void> {
    const gl = canvas.getContext('webgl');
    if (!gl) {
      throw new Error('[twgl] WebGL is not supported');
    }
    this.gl = gl;
    this.programInfo = twgljs.createProgramInfo(this.gl, [shader.texture.vs, shader.texture.fs]);

    console.log('[twgl] WebGL device initialized');
  }

  resize(size: Dimension): void {
    if (!this.gl) return;
    this.gl.canvas.width = size.width;
    this.gl.canvas.height = size.height;
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
  }

  draw(scene: Scene): void {
    if (!this.gl) return;

    twgljs.resizeCanvasToDisplaySize(this.gl.canvas as HTMLCanvasElement);
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clearColor(0.97, 0.97, 0.97, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.gl.enable(this.gl.DEPTH_TEST);
    // this.gl.enable(this.gl.CULL_FACE);

    //const worldViewProjection = twgljs.m4.identity();
    // --- Kamera-Setup ---
    const fieldOfView = Math.PI * 0.25; // 45 Grad
    const aspect = this.gl.canvas.width / this.gl.canvas.height;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = twgljs.m4.perspective(fieldOfView, aspect, zNear, zFar);

    // Kamera um den Ursprung rotieren lassen
    const time = performance.now() * 0.001; // Zeit in Sekunden
    const cameraRadius = 5;
    const cameraX = Math.sin(time) * cameraRadius;
    const cameraZ = Math.cos(time) * cameraRadius;
    const cameraPosition = [cameraX, Math.PI, cameraZ];
    const target = [0, 0, 0]; // Auf den Ursprung schauen
    const up = [0, 1, 0]; // Y-Achse ist oben

    const viewMatrix = twgljs.m4.inverse(twgljs.m4.lookAt(cameraPosition, target, up));

    const worldViewProjection = twgljs.m4.multiply(projectionMatrix, viewMatrix);

    // --- Ende Kamera-Setup ---

    this.gl.useProgram(this.programInfo.program);

    for (const [entity, renderItem] of scene.getComponentStore<component3D.RenderItem3>(component3D.RenderItem3.name).entries()) {
      if (!renderItem.visible) continue;

      let pixelTexture;
      let bufferInfo;
      if (this.renderCache.has(entity) && this.renderCache.get(entity) != undefined) {
        let cache = this.renderCache.get(entity);
        pixelTexture = cache!.texture;
        bufferInfo = cache!.buffer;
      } else {
        const arrays: twgljs.Arrays = {
          position: {
            numComponents: XYZ,
            data: renderItem.geometry.vertices as number[] | Float32Array,
          },
          indices: renderItem.geometry.indices as number[] | Uint16Array | Uint32Array,
        };
        if (renderItem.material instanceof component3D.Material3 && renderItem.material.uvs) {
          arrays.texCoord = {
            numComponents: UV,
            data: renderItem.material.uvs as number[] | Float32Array,
          };
        }
        bufferInfo = twgljs.createBufferInfoFromArrays(this.gl, arrays);

        if (renderItem.material instanceof component3D.BaseColor3) {
          pixelTexture = twgljs.createTexture(this.gl, {
            src: renderItem.material.baseColor as number[],
          });
        } else if (renderItem.material instanceof component3D.Material3) {
          pixelTexture = twgljs.createTexture(this.gl, {
            src: renderItem.material.texture,
          });
        } else {
          pixelTexture = twgljs.createTexture(this.gl, {
            src: [255, 255, 255, 255],
          });
        }
        this.renderCache.set(entity, {
          buffer: bufferInfo,
          texture: pixelTexture,
        });
      }

      const uniforms = {
        u_worldViewProjection: worldViewProjection,
        u_texture: pixelTexture,
      };

      twgljs.setBuffersAndAttributes(this.gl, this.programInfo, bufferInfo);
      twgljs.setUniforms(this.programInfo, uniforms);
      twgljs.drawBufferInfo(this.gl, bufferInfo);
    }
  }

  destroy(): void {
    // twgl hat keine explizite destroy-Methode, der GC sollte das übernehmen.
    // WebGL-Kontextverlust kann hier behandelt werden, falls nötig.
  }
}
