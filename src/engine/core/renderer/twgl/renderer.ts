import * as twgljs from 'twgl.js';
import { component3D, degreeToRadians, type Dimension, type Entity, type RendererBackend } from '../../types/index';
import type { Scene } from '../../world';
import type { RenderItem3 } from '../../types/components3D';
const XYZ = 3;
const UV = 2;

let getShader = async () => {
  let baseColorVertex = await fetch('shader/base-color-vertex.shader');
  let baseColorFragment = await fetch('shader/base-color-fragment.shader');
  let textureVertex = await fetch('shader/texture-vertex.shader');
  let textureFragment = await fetch('shader/texture-fragment.shader');
  return await {
    baseColor: {
      vs: await baseColorVertex.text(),
      fs: await baseColorFragment.text(),
    },
    texture: {
      vs: await textureVertex.text(),
      fs: await textureFragment.text(),
    },
  };
};

interface RenderCache {
  buffer: twgljs.BufferInfo;
  texture?: WebGLTexture;
  programInfo: twgljs.ProgramInfo;
}

export interface TwglRenderSettings {
  clearColor: { r: number; g: number; b: number; a: number };
  enableDepthTest: boolean;
  enableCullFace: boolean;
}

export class TwglRenderer implements RendererBackend {
  private setup: TwglRenderSettings;
  private gl!: WebGLRenderingContext;
  private baseColorProgramInfo!: twgljs.ProgramInfo;
  private textureProgramInfo!: twgljs.ProgramInfo;
  private renderCache: Map<Entity, RenderCache> = new Map<Entity, RenderCache>();

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
    let shader = await getShader();
    this.gl = gl;
    this.baseColorProgramInfo = twgljs.createProgramInfo(this.gl, [shader.baseColor.vs, shader.baseColor.fs]);
    this.textureProgramInfo = twgljs.createProgramInfo(this.gl, [shader.texture.vs, shader.texture.fs]);

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
    this.gl.clearColor(this.setup.clearColor.r, this.setup.clearColor.g, this.setup.clearColor.b, this.setup.clearColor.a);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    if (this.setup.enableDepthTest) {
      this.gl.enable(this.gl.DEPTH_TEST);
    }
    if (this.setup.enableCullFace) {
      this.gl.enable(this.gl.CULL_FACE);
    }

    scenes.forEach((scene: Scene) => {
      let camera: component3D.Camera3 | undefined = undefined;
      let cameraEntity = scene.getActiveCameraEntity();
      if (cameraEntity && scene.getComponentStore<component3D.Camera3>(component3D.Camera3.name).has(cameraEntity)) {
        camera = scene.getComponentStore<component3D.Camera3>(component3D.Camera3.name).get(cameraEntity);
      }

      let worldViewProjection;
      if (camera) {
        // --- Camera-Setup ---
        const aspect = this.gl.canvas.width / this.gl.canvas.height;
        const projectionMatrix = twgljs.m4.perspective(degreeToRadians(camera.fov), aspect, camera.near, camera.far);

        // Camera Rotation
        let viewMatrix;
        if (camera.target) {
          viewMatrix = twgljs.m4.inverse(twgljs.m4.lookAt(camera.position.toArray(), camera.target.position.toArray(), camera.target.up.toArray()));
        } else {
          let rotation = camera.rotation;
          let cameraMatrix = twgljs.m4.identity();
          cameraMatrix = twgljs.m4.translate(cameraMatrix, camera.position.toArray());
          cameraMatrix = twgljs.m4.rotateY(cameraMatrix, rotation.y);
          cameraMatrix = twgljs.m4.rotateX(cameraMatrix, rotation.x);
          cameraMatrix = twgljs.m4.rotateZ(cameraMatrix, rotation.z);
          viewMatrix = twgljs.m4.inverse(cameraMatrix);
        }
        worldViewProjection = twgljs.m4.multiply(projectionMatrix, viewMatrix);
      } else {
        worldViewProjection = twgljs.m4.identity();
      }

      for (const [entity, renderItem] of scene.getComponentStore<component3D.RenderItem3>(component3D.RenderItem3.name).entries()) {
        this.calculateRenderItem(entity, renderItem, worldViewProjection);
      }

      for (const [entity, component] of scene.getComponentStore<component3D.Box3>(component3D.Box3.name).entries()) {
        this.calculateRenderItem(entity, component.renderItem, worldViewProjection);
      }
    });
  }

  calculateRenderItem(entity: Entity, renderItem: RenderItem3, worldViewProjection: twgljs.m4.Mat4) {
    if (!renderItem.visible) return;

    let pixelTexture;
    let bufferInfo;
    let programInfo;

    if (renderItem.isDirty) {
      this.renderCache.delete(entity);
      renderItem.isDirty = false;
    }

    if (this.renderCache.has(entity) && this.renderCache.get(entity) != undefined) {
      let cache = this.renderCache.get(entity);
      pixelTexture = cache!.texture;
      bufferInfo = cache!.buffer;
      programInfo = cache!.programInfo;
    } else {
      const arrays: twgljs.Arrays = {
        position: {
          numComponents: XYZ,
          data: renderItem.geometry.vertices as number[] | Float32Array,
        },
        indices: renderItem.geometry.indices as number[] | Uint16Array | Uint32Array,
      };

      if (renderItem.material instanceof component3D.Material3 && renderItem.material.texture.src && renderItem.material.uvs.length > 0) {
        console.log(renderItem.material.uvs as number[] | Float32Array);
        programInfo = this.textureProgramInfo;
        arrays.texCoord = {
          numComponents: UV,
          data: renderItem.material.uvs as number[] | Float32Array,
        };
        pixelTexture = twgljs.createTexture(this.gl, {
          src: renderItem.material.texture,
          flipY: 1, // TODO das hier muss wegen den Blender Textures gemacht werden, ansonsten 0
        });
      } else {
        programInfo = this.baseColorProgramInfo;
      }

      bufferInfo = twgljs.createBufferInfoFromArrays(this.gl, arrays);

      this.renderCache.set(entity, {
        buffer: bufferInfo,
        texture: pixelTexture,
        programInfo: programInfo,
      });
    }

    this.gl.useProgram(programInfo.program);

    const uniforms: { [key: string]: any } = {
      u_worldViewProjection: worldViewProjection,
    };

    if (programInfo === this.textureProgramInfo) {
      uniforms.u_texture = pixelTexture;
    } else {
      if (renderItem.material instanceof component3D.BaseColor3) {
        const color = renderItem.material.baseColor.toRgb();
        uniforms.u_color = [color.r / 255, color.g / 255, color.b / 255, color.a]; // TODO: Dieses Teilen ist nicht geil
        console.log('BaseColor3', color);
      } else if (renderItem.material instanceof component3D.Material3) {
        const color = renderItem.material.color.toRgb();
        uniforms.u_color = [color.r / 255, color.g / 255, color.b / 255, color.a]; // TODO: Dieses Teilen ist nicht geil
        console.log('Material3', color);
      } else {
        uniforms.u_color = [0.556, 0.556, 0.556, 1]; // Default color
      }
    }

    twgljs.setBuffersAndAttributes(this.gl, programInfo, bufferInfo);
    twgljs.setUniforms(programInfo, uniforms);
    twgljs.drawBufferInfo(this.gl, bufferInfo);
  }

  destroy(): void {
    // twgl hat keine explizite destroy-Methode, der GC sollte das übernehmen.
    // WebGL-Kontextverlust kann hier behandelt werden, falls nötig.
  }
}
