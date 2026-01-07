import * as twglBase from 'twgl.js';
import { type twgl, type Dimension, type RendererBackend } from '../../types/index';
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

export class TwglRenderer implements RendererBackend {
  private gl!: WebGLRenderingContext;
  private programInfo!: twglBase.ProgramInfo;

  async init(canvas: HTMLCanvasElement): Promise<void> {
    const gl = canvas.getContext('webgl');
    if (!gl) {
      throw new Error('[twgl] WebGL is not supported');
    }
    this.gl = gl;
    this.programInfo = twglBase.createProgramInfo(this.gl, [shader.texture.vs, shader.texture.fs]);
    
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

    twglBase.resizeCanvasToDisplaySize(this.gl.canvas as HTMLCanvasElement);
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clearColor(0.97, 0.97, 0.97, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.CULL_FACE);

    const worldViewProjection = twglBase.m4.identity();

    this.gl.useProgram(this.programInfo.program);

    for (const [, renderItem] of scene.getComponentStore<twgl.TwglRenderItem>(twgl.TwglRenderItem.name).entries()) {
      // TODO if (!mesh.visible || !mesh.geometry) continue;

      const arrays: twglBase.Arrays = {
        position: {
          numComponents: XYZ,
          data: renderItem.geometry.vertices as number[] | Float32Array,
        },
        indices: renderItem.geometry.indices as number[] | Uint16Array | Uint32Array,
      };


      let pixelTexture;
      if (renderItem.material instanceof twgl.TwglBaseColor) {
        pixelTexture = twglBase.createTexture(this.gl, {
          src: renderItem.material.baseColor,
        });
      } else if (renderItem.material instanceof twgl.TwglMaterial) {
        arrays.texCoord = {
          numComponents: UV,
          data: renderItem.material.uvs as number[] | Float32Array,
        };
        pixelTexture = twglBase.createTexture(this.gl, {
          src: renderItem.material.texture,
        });
      } else {
        pixelTexture = twglBase.createTexture(this.gl, {
          src: [255, 255, 255, 255],
        });
      }

      const bufferInfo = twglBase.createBufferInfoFromArrays(this.gl, arrays);

      const uniforms = {
        u_worldViewProjection: worldViewProjection,
        u_texture: pixelTexture,
      };

      twglBase.setBuffersAndAttributes(this.gl, this.programInfo, bufferInfo);
      twglBase.setUniforms(this.programInfo, uniforms);
      twglBase.drawBufferInfo(this.gl, bufferInfo);
    }
  }

  destroy(): void {
    // twgl hat keine explizite destroy-Methode, der GC sollte das übernehmen.
    // WebGL-Kontextverlust kann hier behandelt werden, falls nötig.
  }
}
