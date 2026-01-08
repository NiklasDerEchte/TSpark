import * as twgljs from 'twgl.js';
import { component3D, degreeToRadians, type Dimension, type Entity, type RendererBackend } from '../../types/index';
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

  draw(scenes: Scene[]): void {
    if (!this.gl) return;

    twgljs.resizeCanvasToDisplaySize(this.gl.canvas as HTMLCanvasElement);
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clearColor(0.97, 0.97, 0.97, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.gl.enable(this.gl.DEPTH_TEST);
    // this.gl.enable(this.gl.CULL_FACE);

    scenes.forEach((scene: Scene) => {
      let camera: component3D.Camera3 | undefined = undefined;
      if (scene.getComponentStore<component3D.Camera3>(component3D.Camera3.name).has(scene.getActiveCameraEntity() ?? 'undefined')) {
        camera = scene.getComponentStore<component3D.Camera3>(component3D.Camera3.name).get(scene.getActiveCameraEntity() ?? 'undefined');
      }

      let worldViewProjection;
      if (camera) {
        // --- Camera-Setup ---
        const aspect = this.gl.canvas.width / this.gl.canvas.height;
        const projectionMatrix = twgljs.m4.perspective(degreeToRadians(camera.fov), aspect, camera.near, camera.far);

        // Camera Rotation
        const viewMatrix = twgljs.m4.inverse(twgljs.m4.lookAt(camera.position.toArray(), camera.target.toArray(), camera.up.toArray()));
        worldViewProjection = twgljs.m4.multiply(projectionMatrix, viewMatrix);
      } else {
        worldViewProjection = twgljs.m4.identity();
      }

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
    });
  }

  destroy(): void {
    // twgl hat keine explizite destroy-Methode, der GC sollte das übernehmen.
    // WebGL-Kontextverlust kann hier behandelt werden, falls nötig.
  }
}
