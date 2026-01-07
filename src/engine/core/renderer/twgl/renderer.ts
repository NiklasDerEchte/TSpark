import * as twgl from 'twgl.js';
import type { component3D, Dimension, RendererBackend } from '../../types/index';
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
  attribute vec2 texCoord; // 1. Attribut für UVs hinzufügen

  uniform mat4 u_worldViewProjection;

  varying vec2 v_texCoord; // 2. Varying, um UVs an Fragment-Shader weiterzugeben

  void main() {
    gl_Position = u_worldViewProjection * position;
    v_texCoord = texCoord; // 3. UVs weitergeben
  }
`,
    fs: `
  precision mediump float;

  uniform sampler2D u_texture; // 4. Uniform für die Textur statt Farbe
  varying vec2 v_texCoord;     // 5. UVs vom Vertex-Shader empfangen

  void main() {
    // 6. Farbe aus der Textur an der Koordinate v_texCoord auslesen
    gl_FragColor = texture2D(u_texture, v_texCoord);
  }
`,
  },
};

export class TwglRenderer implements RendererBackend {
  private gl!: WebGLRenderingContext;
  private programInfo!: twgl.ProgramInfo;
  private whitePixelTexture!: WebGLTexture; // Platzhalter-Textur

  async init(canvas: HTMLCanvasElement): Promise<void> {
    const gl = canvas.getContext('webgl');
    if (!gl) {
      throw new Error('[twgl] WebGL is not supported');
    }
    this.gl = gl;
    this.programInfo = twgl.createProgramInfo(this.gl, [shader.texture.vs, shader.texture.fs]);

    this.whitePixelTexture = twgl.createTexture(this.gl, {
      src: [255, 255, 255, 255],
    });
    
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

    twgl.resizeCanvasToDisplaySize(this.gl.canvas as HTMLCanvasElement);
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clearColor(0.97, 0.97, 0.97, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.CULL_FACE);

    const worldViewProjection = twgl.m4.identity();

    this.gl.useProgram(this.programInfo.program);

    for (const [, mesh] of scene.getComponentStore<component3D.Mesh>('mesh3d').entries()) {
      if (!mesh.visible || !mesh.geometry) continue;

      const arrays: twgl.Arrays = {
        position: {
          numComponents: XYZ,
          data: mesh.geometry.vertices as number[] | Float32Array,
        },
      };

      if (mesh.geometry.uvs) {
        arrays.texCoord = {
          numComponents: UV,
          data: mesh.geometry.uvs as number[] | Float32Array,
        };
      }

      if (mesh.geometry.indices) {
        arrays.indices = mesh.geometry.indices as number[] | Uint16Array | Uint32Array;
      }

      const bufferInfo = twgl.createBufferInfoFromArrays(this.gl, arrays);
      const texture = mesh.geometry.texture || this.whitePixelTexture;

      const uniforms = {
        u_worldViewProjection: worldViewProjection,
        u_texture: texture,
      };

      twgl.setBuffersAndAttributes(this.gl, this.programInfo, bufferInfo);
      twgl.setUniforms(this.programInfo, uniforms);
      twgl.drawBufferInfo(this.gl, bufferInfo);
    }
  }

  destroy(): void {
    // twgl hat keine explizite destroy-Methode, der GC sollte das übernehmen.
    // WebGL-Kontextverlust kann hier behandelt werden, falls nötig.
  }
}
